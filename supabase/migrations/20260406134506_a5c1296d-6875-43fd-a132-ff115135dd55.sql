INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('ADANIENSOL', 'Adani Energy Solutions Ltd', 'Power Transmission', 'ADANIENSOL', 'Large Cap')
ON CONFLICT DO NOTHING;