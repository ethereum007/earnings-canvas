INSERT INTO public.companies (symbol, name, sector, screener_slug, market_cap)
VALUES ('HDFCLIFE', 'HDFC Life Insurance Co Ltd', 'Financial Services', 'HDFCLIFE', 'Large Cap')
ON CONFLICT DO NOTHING;