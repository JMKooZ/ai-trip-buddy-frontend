interface CategoryRule {
  label: string;
  keywords: string[];
}

// 네이버 카테고리 문자열(예: "음식점>한식>육류,고기")에서 대표 키워드를 찾아 매핑
const CATEGORY_RULES: CategoryRule[] = [
  { label: "카페", keywords: ["카페", "디저트", "베이커리", "제과", "아이스크림"] },
  { label: "맛집", keywords: ["음식점", "한식", "중식", "일식", "양식", "분식", "고기", "해산물", "뷔페", "패스트푸드"] },
  { label: "술집", keywords: ["술집", "유흥", "호프", "포차", "와인바"] },
  { label: "숙박", keywords: ["숙박", "호텔", "펜션", "게스트하우스", "모텔"] },
  { label: "쇼핑", keywords: ["쇼핑", "마트", "백화점", "시장", "아울렛"] },
  { label: "문화", keywords: ["문화", "공연", "전시", "박물관", "미술관", "영화"] },
  { label: "관광", keywords: ["관광", "명소", "유적", "공원", "자연", "해수욕장", "산"] },
];

export function inferPlaceCategory(rawCategory?: string | null): string {
  if (!rawCategory) return "관광";

  for (const rule of CATEGORY_RULES) {
    if (rule.keywords.some((keyword) => rawCategory.includes(keyword))) {
      return rule.label;
    }
  }

  return "관광";
}