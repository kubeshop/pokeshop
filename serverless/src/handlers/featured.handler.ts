import { PromiseHandler } from '@lambda-middleware/utils';
import FeaturedService from '../services/fetured.service';

const featuredService = FeaturedService();

const featured: PromiseHandler = async () => {
  const items = await featuredService.get();

  return items;
};

export default featured;
