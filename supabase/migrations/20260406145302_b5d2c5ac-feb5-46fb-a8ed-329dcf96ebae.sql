INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('KANSAINER', 'Kansai Nerolac Paints Ltd', 'Chemicals - Paints', 'KANSAINER', 'Mid Cap')
ON CONFLICT DO NOTHING;