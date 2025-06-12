    // pages/api/search.js
import {client} from '../../app/utils/sanityClient';

export default async function handler(req, res) {
  const query = req.query.q; // get the search query from the request
  if (!query) {
    return res.status(400).json({ message: 'Query is required' });
  }

  try {
    const results = await client.fetch(`*[_type in ["images", "stories", "wallpaper", "products"] && (title match $query)]{_type, title, description, "slug": slug.current}`, { query });
    res.status(200).json(results);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching search results', error });
  }
}
