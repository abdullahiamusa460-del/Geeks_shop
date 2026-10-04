import { products, type Product } from '../data/products'

const productById = new Map(products.map((p) => [p.id, p]))

interface RecommendationInput {
  currentProduct?: Product
  favoriteProducts?: Product[]
  viewedIds?: string[]
  limit?: number
}

/**
 * Ranks products by relevance to the user: same category/sizing/color as the
 * current product, then affinity with favorited and recently viewed products.
 * Falls back to popular (most reviewed) and recently added products when there
 * are not enough strong signals.
 */
export function getRecommendations({
  currentProduct,
  favoriteProducts = [],
  viewedIds = [],
  limit = 4,
}: RecommendationInput): Product[] {
  const favoriteCategories = new Set(
    favoriteProducts.map((p) => p.category),
  )
  const viewedSet = new Set(viewedIds)
  const viewedIdList = viewedIds.filter((id) => productById.has(id))
  const excluded = new Set<string>(
    currentProduct ? [currentProduct.id] : [],
  )

  const scored = products
    .filter((p) => !excluded.has(p.id))
    .map((p) => {
      let score = 0

      if (currentProduct) {
        if (p.category === currentProduct.category) score += 10
        if (p.colors.some((c) => currentProduct.colors.includes(c))) score += 2
        if (p.sizes.some((s) => currentProduct.sizes.includes(s))) score += 1
      }

      if (favoriteCategories.has(p.category)) score += 6

      if (viewedSet.has(p.id)) score += 4

      for (const viewedId of viewedIdList) {
        const viewed = productById.get(viewedId)
        if (viewed && viewed.category === p.category) {
          score += 3
          break
        }
      }

      return { product: p, score }
    })

  scored.sort(
    (a, b) =>
      b.score - a.score ||
      b.product.reviews - a.product.reviews ||
      products.indexOf(a.product) - products.indexOf(b.product),
  )

  return scored.slice(0, limit).map((s) => s.product)
}