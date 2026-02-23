-- +goose Up
UPDATE sections
SET
  title_ru = 'Плазма в синтезе материалов, в том числе и наноматериалов',
  title_en = 'Plasma in material synthesis, including nanomaterials'
WHERE title_ru = 'Плазма в синтезе наноматериалов';

-- +goose Down
UPDATE sections
SET
  title_ru = 'Плазма в синтезе наноматериалов',
  title_en = 'Plasma in Nanomaterial Synthesis'
WHERE title_ru = 'Плазма в синтезе материалов, в том числе и наноматериалов';
