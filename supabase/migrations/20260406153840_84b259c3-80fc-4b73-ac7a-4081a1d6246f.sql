INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('PGHH', 'Procter & Gamble Hygiene and Health Care Ltd', 'FMCG', 'PGHH', 'Large Cap')
ON CONFLICT DO NOTHING;