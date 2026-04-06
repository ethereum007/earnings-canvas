INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('CRISIL', 'CRISIL Ltd', 'Financial Services', 'CRISIL', 'Large Cap')
ON CONFLICT DO NOTHING;