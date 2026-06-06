insert into public.type_systems (code, name, description, position)
values
  ('mbti', 'MBTI', 'Myers-Briggs style 16 type system.', 10),
  ('enneagram', 'Enneagram', 'Enneagram core type and wing combinations.', 20),
  ('socionics', 'Socionics', 'Socionics 16 information metabolism types.', 30),
  ('psychosophy', 'Psychosophy', 'Representative Psychosophy attitude type values.', 40)
on conflict (code) do update
set
  name = excluded.name,
  description = excluded.description,
  position = excluded.position,
  is_active = true,
  updated_at = now();

with mbti(system_id, code, position) as (
  select type_systems.id, v.code, v.position
  from public.type_systems
  cross join (
    values
      ('INTJ', 10),
      ('INTP', 20),
      ('ENTJ', 30),
      ('ENTP', 40),
      ('INFJ', 50),
      ('INFP', 60),
      ('ENFJ', 70),
      ('ENFP', 80),
      ('ISTJ', 90),
      ('ISFJ', 100),
      ('ESTJ', 110),
      ('ESFJ', 120),
      ('ISTP', 130),
      ('ISFP', 140),
      ('ESTP', 150),
      ('ESFP', 160)
  ) as v(code, position)
  where type_systems.code = 'mbti'
)
insert into public.type_values (type_system_id, code, name, position)
select system_id, code, code, position
from mbti
on conflict (type_system_id, code) do update
set
  name = excluded.name,
  position = excluded.position,
  is_active = true,
  updated_at = now();

with enneagram(system_id, code, position) as (
  select type_systems.id, v.code, v.position
  from public.type_systems
  cross join (
    values
      ('1w9', 10),
      ('1w2', 20),
      ('2w1', 30),
      ('2w3', 40),
      ('3w2', 50),
      ('3w4', 60),
      ('4w3', 70),
      ('4w5', 80),
      ('5w4', 90),
      ('5w6', 100),
      ('6w5', 110),
      ('6w7', 120),
      ('7w6', 130),
      ('7w8', 140),
      ('8w7', 150),
      ('8w9', 160),
      ('9w8', 170),
      ('9w1', 180)
  ) as v(code, position)
  where type_systems.code = 'enneagram'
)
insert into public.type_values (type_system_id, code, name, position)
select system_id, code, code, position
from enneagram
on conflict (type_system_id, code) do update
set
  name = excluded.name,
  position = excluded.position,
  is_active = true,
  updated_at = now();

with socionics(system_id, code, position) as (
  select type_systems.id, v.code, v.position
  from public.type_systems
  cross join (
    values
      ('ILE', 10),
      ('SEI', 20),
      ('ESE', 30),
      ('LII', 40),
      ('EIE', 50),
      ('LSI', 60),
      ('SLE', 70),
      ('IEI', 80),
      ('SEE', 90),
      ('ILI', 100),
      ('LIE', 110),
      ('ESI', 120),
      ('LSE', 130),
      ('EII', 140),
      ('IEE', 150),
      ('SLI', 160)
  ) as v(code, position)
  where type_systems.code = 'socionics'
)
insert into public.type_values (type_system_id, code, name, position)
select system_id, code, code, position
from socionics
on conflict (type_system_id, code) do update
set
  name = excluded.name,
  position = excluded.position,
  is_active = true,
  updated_at = now();

with psychosophy(system_id, code, position) as (
  select type_systems.id, v.code, v.position
  from public.type_systems
  cross join (
    values
      ('FEVL',  10),
      ('FELV',  20),
      ('FVEL',  30),
      ('FVLE',  40),
      ('FLEV',  50),
      ('FLVE',  60),

      ('EFVL',  70),
      ('EFLV',  80),
      ('EVFL',  90),
      ('EVLF', 100),
      ('ELFV', 110),
      ('ELVF', 120),

      ('VFEL', 130),
      ('VFLE', 140),
      ('VEFL', 150),
      ('VELF', 160),
      ('VLFE', 170),
      ('VLEF', 180),

      ('LFEV', 190),
      ('LFVE', 200),
      ('LEFV', 210),
      ('LEVF', 220),
      ('LVFE', 230),
      ('LVEF', 240)
  ) as v(code, position)
  where type_systems.code = 'psychosophy'
)
insert into public.type_values (type_system_id, code, name, position)
select system_id, code, code, position
from psychosophy
on conflict (type_system_id, code) do update
set
  name = excluded.name,
  position = excluded.position,
  is_active = true,
  updated_at = now();
