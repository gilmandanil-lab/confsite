-- +goose Up
INSERT INTO sections (id, title_ru, title_en, created_at) VALUES
  (gen_random_uuid(), 'Теплофизические свойства плазмы', 'Thermal Properties of Plasma', NOW()),
  (gen_random_uuid(), 'Физика газовых разрядов', 'Gas Discharge Physics', NOW()),
  (gen_random_uuid(), 'Элементарные процессы в плазме', 'Elementary Processes in Plasma', NOW()),
  (gen_random_uuid(), 'Неравновесная плазма, кинетика плазмы', 'Non-equilibrium Plasma, Plasma Kinetics', NOW()),
  (gen_random_uuid(), 'Численное моделирование плазменных процессов', 'Numerical Modeling of Plasma Processes', NOW()),
  (gen_random_uuid(), 'Диагностика плазмы', 'Plasma Diagnostics', NOW()),
  (gen_random_uuid(), 'Взаимодействие плазмы с веществом', 'Plasma-Matter Interaction', NOW()),
  (gen_random_uuid(), 'Плазмохимия и плазменные технологии', 'Plasma Chemistry and Plasma Technologies', NOW()),
  (gen_random_uuid(), 'Плазма в атмосфере, ионосфере, астрофизике', 'Plasma in Atmosphere, Ionosphere, Astrophysics', NOW()),
  (gen_random_uuid(), 'Плазма в медико-биологических приложениях', 'Plasma in Medical and Biological Applications', NOW()),
  (gen_random_uuid(), 'Плазмодинамика, плазменные двигатели', 'Plasma Dynamics, Plasma Thrusters', NOW()),
  (gen_random_uuid(), 'Плазма в синтезе наноматериалов', 'Plasma in Nanomaterial Synthesis', NOW());

-- +goose Down
DELETE FROM sections WHERE title_ru IN (
  'Теплофизические свойства плазмы',
  'Физика газовых разрядов',
  'Элементарные процессы в плазме',
  'Неравновесная плазма, кинетика плазмы',
  'Численное моделирование плазменных процессов',
  'Диагностика плазмы',
  'Взаимодействие плазмы с веществом',
  'Плазмохимия и плазменные технологии',
  'Плазма в атмосфере, ионосфере, астрофизике',
  'Плазма в медико-биологических приложениях',
  'Плазмодинамика, плазменные двигатели',
  'Плазма в синтезе наноматериалов'
);
