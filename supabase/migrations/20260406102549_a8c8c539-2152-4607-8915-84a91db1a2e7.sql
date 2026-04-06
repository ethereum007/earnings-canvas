INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('ELECON', 'Elecon Engineering Co Ltd', 'Industrials', 'ELECON', 'Mid Cap')
ON CONFLICT DO NOTHING;