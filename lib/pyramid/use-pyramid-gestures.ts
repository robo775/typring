"use client";

import { useRef } from "react";
import type { PlacedPyramidPart } from "@/types/pyramid";

const VIEW_BOX_SIZE = 1000;
const MIN_SCALE = 0.45;
const MAX_SCALE = 2.4;

type Point = { x: number; y: number };

type GestureState =
  | {
      instanceId: string;
      offsetX: number;
      offsetY: number;
      type: "drag";
    }
  | {
      instanceId: string;
      startAngle: number;
      startDistance: number;
      startRotation: number;
      startScale: number;
      type: "pinch";
    };

export function usePyramidGestures({
  onGestureEnd,
  onSelect,
  setPlacedParts,
  svgRef
}: {
  onGestureEnd: (snapshot: PlacedPyramidPart[]) => void;
  onSelect: (instanceId: string | null) => void;
  setPlacedParts: React.Dispatch<React.SetStateAction<PlacedPyramidPart[]>>;
  svgRef: React.RefObject<SVGSVGElement>;
}) {
  const pointersRef = useRef(new Map<number, Point>());
  const gestureRef = useRef<GestureState | null>(null);
  const snapshotRef = useRef<PlacedPyramidPart[] | null>(null);
  const movedRef = useRef(false);

  function getSvgPoint(event: React.PointerEvent<SVGElement>): Point | null {
    const svg = svgRef.current;

    if (!svg) {
      return null;
    }

    const rect = svg.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * VIEW_BOX_SIZE,
      y: ((event.clientY - rect.top) / rect.height) * VIEW_BOX_SIZE
    };
  }

  function handlePartPointerDown(
    event: React.PointerEvent<SVGGElement>,
    placedPart: PlacedPyramidPart,
    currentParts: PlacedPyramidPart[]
  ) {
    const point = getSvgPoint(event);

    if (!point) {
      return;
    }

    event.stopPropagation();
    event.currentTarget.setPointerCapture(event.pointerId);
    pointersRef.current.set(event.pointerId, point);
    onSelect(placedPart.instanceId);

    if (!snapshotRef.current) {
      snapshotRef.current = currentParts;
      movedRef.current = false;
    }

    gestureRef.current = {
      instanceId: placedPart.instanceId,
      offsetX: point.x - placedPart.x,
      offsetY: point.y - placedPart.y,
      type: "drag"
    };
  }

  function handleCanvasPointerDown(
    event: React.PointerEvent<SVGSVGElement>,
    currentParts: PlacedPyramidPart[]
  ) {
    const point = getSvgPoint(event);

    if (!point) {
      return;
    }

    const gesture = gestureRef.current;

    // 2本目の指: ドラッグ中のパーツをピンチ操作（拡縮・回転）に切り替え
    if (gesture && pointersRef.current.size === 1) {
      pointersRef.current.set(event.pointerId, point);
      const points = [...pointersRef.current.values()];
      const target = currentParts.find(
        (part) => part.instanceId === gesture.instanceId
      );

      if (points.length === 2 && target) {
        gestureRef.current = {
          instanceId: gesture.instanceId,
          startAngle: angleBetween(points[0], points[1]),
          startDistance: distanceBetween(points[0], points[1]),
          startRotation: target.rotation,
          startScale: target.scale,
          type: "pinch"
        };
      }

      return;
    }

    if (!gesture) {
      // 空白タップ: 選択解除
      onSelect(null);
    }

    pointersRef.current.set(event.pointerId, point);
  }

  function handlePointerMove(event: React.PointerEvent<SVGSVGElement>) {
    const gesture = gestureRef.current;

    if (!gesture) {
      return;
    }

    const point = getSvgPoint(event);

    if (!point) {
      return;
    }

    if (!pointersRef.current.has(event.pointerId)) {
      return;
    }

    pointersRef.current.set(event.pointerId, point);

    if (gesture.type === "drag") {
      movedRef.current = true;
      setPlacedParts((current) =>
        current.map((part) =>
          part.instanceId === gesture.instanceId
            ? {
                ...part,
                x: clamp(point.x - gesture.offsetX, 40, 960),
                y: clamp(point.y - gesture.offsetY, 40, 940)
              }
            : part
        )
      );
      return;
    }

    const points = [...pointersRef.current.values()];

    if (points.length < 2) {
      return;
    }

    const distance = distanceBetween(points[0], points[1]);
    const angle = angleBetween(points[0], points[1]);
    const nextScale = clamp(
      gesture.startScale * (distance / gesture.startDistance),
      MIN_SCALE,
      MAX_SCALE
    );
    const nextRotation = Math.round(
      gesture.startRotation + (angle - gesture.startAngle)
    );

    movedRef.current = true;
    setPlacedParts((current) =>
      current.map((part) =>
        part.instanceId === gesture.instanceId
          ? {
              ...part,
              rotation: nextRotation,
              scale: Number(nextScale.toFixed(2))
            }
          : part
      )
    );
  }

  function handlePointerUp(event: React.PointerEvent<SVGSVGElement>) {
    pointersRef.current.delete(event.pointerId);

    if (pointersRef.current.size > 0) {
      // ピンチ中に片方の指が離れたらジェスチャ終了（残りの指での誤操作防止）
      gestureRef.current = null;
      return;
    }

    if (snapshotRef.current && movedRef.current) {
      onGestureEnd(snapshotRef.current);
    }

    gestureRef.current = null;
    snapshotRef.current = null;
    movedRef.current = false;
  }

  return {
    handleCanvasPointerDown,
    handlePartPointerDown,
    handlePointerMove,
    handlePointerUp
  };
}

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function distanceBetween(a: Point, b: Point) {
  return Math.hypot(b.x - a.x, b.y - a.y);
}

function angleBetween(a: Point, b: Point) {
  return (Math.atan2(b.y - a.y, b.x - a.x) * 180) / Math.PI;
}
