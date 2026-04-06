INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('JSWSTEEL', 'JSW Steel Ltd', 'Steel', 'JSWSTEEL', 'Large Cap')
ON CONFLICT DO NOTHING;