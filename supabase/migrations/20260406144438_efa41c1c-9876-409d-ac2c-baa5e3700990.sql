INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('BLUESTARCO', 'Blue Star Ltd', 'Consumer Durables', 'BLUESTARCO', 'Mid Cap')
ON CONFLICT DO NOTHING;