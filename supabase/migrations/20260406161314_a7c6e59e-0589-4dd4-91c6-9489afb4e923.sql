INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('BERGEPAINT', 'Berger Paints India Ltd', 'Chemicals - Paints', 'BERGEPAINT', 'Large Cap')
ON CONFLICT DO NOTHING;