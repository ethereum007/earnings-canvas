INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('ANGELONE', 'Angel One Ltd', 'Financial Services', 'ANGELONE', 'Mid Cap')
ON CONFLICT DO NOTHING;