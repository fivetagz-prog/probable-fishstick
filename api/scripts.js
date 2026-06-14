export default async function handler(req, res) {
  try {
    const { q = "", page = 1 } = req.query;

    const url = q
      ? `https://scriptblox.com/api/script/search?q=${encodeURIComponent(q)}&page=${page}`
      : `https://scriptblox.com/api/script/fetch?page=${page}`;

    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0"
      }
    });

    const data = await response.json();

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({
      error: String(err)
    });
  }
}
