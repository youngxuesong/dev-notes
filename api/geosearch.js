// Vercel Serverless Function: 全球地理搜索高可用代理
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Cache-Control', 's-maxage=86400, stale-while-revalidate');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  const { q } = req.query;
  if (!q) {
    return res.status(400).json({ error: 'Missing query parameter q' });
  }

  const rawQuery = String(q).trim();

  // 1. 针对香港及交通枢纽关键词去噪
  const cleanStation = rawQuery.replace(/地铁站|地鐵站|火车站|車站|车站/g, '站').trim();
  const baseName = rawQuery.replace(/香港|特别行政区|特区|地铁站|地鐵站|火车站|车站|站/g, '').trim();

  const candidates = Array.from(
    new Set([rawQuery, cleanStation, baseName, `${baseName} Station`, `Hong Kong ${baseName}`].filter((s) => s.length >= 2)),
  );

  let results = [];

  for (const term of candidates) {
    try {
      // 优先从 Nominatim 检索
      const osmUrl = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        term,
      )}&addressdetails=1&limit=5`;
      const osmResp = await fetch(osmUrl, {
        headers: {
          'User-Agent': 'DevNotes-AddressLookup/1.0 (contact@kuyiduo.hidns.vip)',
          'Accept-Language': 'zh-CN,zh-HK,en;q=0.9',
        },
      });

      if (osmResp.ok) {
        const data = await osmResp.json();
        if (Array.isArray(data) && data.length > 0) {
          results = data.map((item) => {
            const addr = item.address || {};
            const isHK = (item.display_name + JSON.stringify(addr)).toLowerCase().includes('hong kong') || (item.display_name).includes('香港');
            return {
              name: item.name || item.display_name.split(',')[0],
              displayName: item.display_name,
              road: addr.road || addr.street || addr.highway || '',
              suburb: addr.suburb || addr.district || addr.quarter || addr.locality || '',
              city: isHK ? 'Hong Kong' : (addr.city || addr.town || addr.municipality || 'Hong Kong'),
              state: isHK ? (addr.state || 'New Territories') : (addr.state || addr.province || ''),
              country: isHK ? 'Hong Kong' : (addr.country || 'Hong Kong'),
              countryCode: isHK ? 'HK' : (addr.country_code || 'HK').toUpperCase(),
              postcode: isHK ? '999077' : (addr.postcode || ''),
              lat: item.lat,
              lon: item.lon,
              source: 'OpenStreetMap',
            };
          });
          break;
        }
      }

      // 如果 Nominatim 未命中，备用 Photon 接口
      const photonUrl = `https://photon.komoot.io/api/?q=${encodeURIComponent(term)}&limit=5`;
      const pResp = await fetch(photonUrl);
      if (pResp.ok) {
        const pData = await pResp.json();
        if (pData?.features?.length > 0) {
          results = pData.features.map((feat) => {
            const p = feat.properties || {};
            const isHK = (p.name + p.state + p.country).includes('香港') || (p.name + p.state + p.country).toLowerCase().includes('hong kong');
            return {
              name: p.name || p.street || '',
              displayName: `${p.name || ''}, ${p.street || ''}, ${p.district || p.city || ''}, ${p.state || ''}`,
              road: p.street || '',
              suburb: p.district || p.locality || '',
              city: isHK ? 'Hong Kong' : (p.city || 'Hong Kong'),
              state: isHK ? 'New Territories' : (p.state || ''),
              country: isHK ? 'Hong Kong' : (p.country || 'Hong Kong'),
              countryCode: isHK ? 'HK' : (p.countrycode || 'HK').toUpperCase(),
              postcode: isHK ? '999077' : (p.postcode || ''),
              lat: String(feat.geometry?.coordinates?.[1] || ''),
              lon: String(feat.geometry?.coordinates?.[0] || ''),
              source: 'Photon Global',
            };
          });
          break;
        }
      }
    } catch (e) {
      // 容错处理
    }
  }

  return res.status(200).json({ results });
}
