import { jsonResponse } from '@pokemon/middlewares/response';
import FeaturedService from '@pokemon/services/fetured.service';
const featuredService = FeaturedService();

export const featured = async () => {
  const items = await featuredService.get();

  return items;
};

export default function setupRoute(router) {
  router.get('/pokemon/featured', jsonResponse(200), featured);
}
