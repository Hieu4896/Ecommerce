/**
 * Interface cho các object có thuộc tính title
 */
export interface TitleFilterable {
  title?: string;
}

/**
 * Lọc danh sách items theo thuộc tính title
 * @param items - Danh sách items cần lọc
 * @param query - Từ khóa tìm kiếm
 * @returns Danh sách items đã lọc
 */
export const filterByTitle = <T extends TitleFilterable>(items: T[], query: string): T[] => {
  if (!query.trim()) return items;

  const searchTerm = query.toLowerCase().trim();
  return items.filter((item) => item.title && item.title.toLowerCase().includes(searchTerm));
};
