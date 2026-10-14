INSERT INTO categories (name) VALUES
  ('Hardware'),
  ('Software'),
  ('Redes'),
  ('Accesos'),
  ('Otros')
ON CONFLICT (name) DO NOTHING;
