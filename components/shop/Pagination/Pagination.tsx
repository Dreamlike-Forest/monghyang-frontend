'use client';

import './Pagination.css';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  siblingCount?: number; // 현재 페이지 주변에 보여줄 페이지 수
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  onPageChange,
  siblingCount = 1
}) => {
  // 페이지 번호 배열 생성
  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    
    // 총 페이지가 7개 이하면 모든 페이지를 보여줌
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
      return pages;
    }

    // 첫 페이지는 항상 표시
    pages.push(1);

    // 시작 페이지 계산
    const leftSiblingIndex = Math.max(currentPage - siblingCount, 1);
    const rightSiblingIndex = Math.min(currentPage + siblingCount, totalPages);

    // 왼쪽 ellipsis 표시 여부
    const shouldShowLeftEllipsis = leftSiblingIndex > 2;
    // 오른쪽 ellipsis 표시 여부
    const shouldShowRightEllipsis = rightSiblingIndex < totalPages - 1;

    if (shouldShowLeftEllipsis) {
      pages.push('...');
    }

    // 현재 페이지 주변 페이지들
    for (let i = leftSiblingIndex; i <= rightSiblingIndex; i++) {
      if (i !== 1 && i !== totalPages) {
        pages.push(i);
      }
    }

    if (shouldShowRightEllipsis) {
      pages.push('...');
    }

    // 마지막 페이지는 항상 표시 (첫 페이지와 다른 경우에만)
    if (totalPages !== 1) {
      pages.push(totalPages);
    }

    return pages;
  };

  const handlePageChange = (page: number) => {
    if (page >= 1 && page <= totalPages && page !== currentPage) {
      onPageChange(page);
    }
  };

  const handlePrevious = () => {
    handlePageChange(currentPage - 1);
  };

  const handleNext = () => {
    handlePageChange(currentPage + 1);
  };

  if (totalPages <= 1) {
    return null; // 페이지가 1개 이하면 pagination 숨김
  }

  const pageNumbers = generatePageNumbers();

  return (
    <div className="pagination-container">
      {/* 이전 페이지 버튼 */}
      <button
        className="pagination-button pagination-arrow"
        onClick={handlePrevious}
        disabled={currentPage === 1}
        title="이전 페이지"
      >
        ◀
      </button>

      {/* 페이지 번호들 */}
      {pageNumbers.map((page, index) => {
        if (page === '...') {
          return (
            <span key={`ellipsis-${index}`} className="pagination-ellipsis">
              ...
            </span>
          );
        }

        const pageNumber = page as number;
        return (
          <button
            key={pageNumber}
            className={`pagination-button pagination-number ${
              currentPage === pageNumber ? 'active' : ''
            }`}
            onClick={() => handlePageChange(pageNumber)}
          >
            {pageNumber}
          </button>
        );
      })}

      {/* 다음 페이지 버튼 */}
      <button
        className="pagination-button pagination-arrow"
        onClick={handleNext}
        disabled={currentPage === totalPages}
        title="다음 페이지"
      >
        ▶
      </button>
    </div>
  );
};

export default Pagination;