<style>
    /* ---------- Pagination (plain CSS) ---------- */
.pagination-container {
  display: flex;
  justify-content: center;
  margin: 18px 0;
  font-family: 'Poppins', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
}

.pagination-list {
  display: inline-flex;
  gap: 8px;
  list-style: none;
  padding: 0;
  margin: 0;
  align-items: center;
}

/* item wrapper */
.page-item {}

/* link / span style */
.page-link {
  display: inline-block;
  min-width: 2px;
  padding: 1px 7px;
  text-align: center;
  border-radius: 8px;
  background: #f5f6f8;
  color: #333;
  text-decoration: none;
  border: 1px solid #e6e7ea;
  font-weight: 600;
  box-sizing: border-box;
  transition: background-color 160ms ease, color 160ms ease, transform 120ms ease;
}

/* hover for clickable links */
.page-item:not(.disabled) .page-link:hover {
  background: #0b74da;     /* blue hover */
  color: #fff;
  transform: translateY(-1px);
  border-color: #0b74da;
}

/* active page */
.page-item.active .page-link {
  background: #0b74da;
  color: #fff;
  border-color: #0b74da;
  cursor: default;
  font-weight: 700;
}

/* disabled */
.page-item.disabled .page-link {
  background: #fafafa;
  color: #9aa0a6;
  border-color: #f0f0f0;
  opacity: 0.75;
  cursor: not-allowed;
  transform: none;
}

/* smaller screens: compress buttons */
@media (max-width: 480px) {
  .page-link {
    padding: 6px 8px;
    min-width: 30px;
    font-size: 14px;
    border-radius: 6px;
  }

  .pagination-list { gap: 6px; }
}

/* better wrapping for many pages */
@media (max-width: 768px) {
  .pagination-list {
    flex-wrap: wrap;
    gap: 6px;
  }
}

</style>
@if ($paginator->hasPages())
<nav aria-label="Pagination Navigation" class="pagination-container">
    <ul class="pagination-list">
        {{-- Previous Page Link --}}
        @if ($paginator->onFirstPage())
            <li class="page-item disabled" aria-disabled="true" aria-label="@lang('pagination.previous')">
                <span class="page-link" aria-hidden="true">&laquo;</span>
            </li>
        @else
            <li class="page-item" aria-label="@lang('pagination.previous')">
                <a class="page-link" href="{{ $paginator->previousPageUrl() }}" rel="prev">&laquo;</a>
            </li>
        @endif

        {{-- Pagination Elements --}}
        @foreach ($elements as $element)
            {{-- "Three Dots" Separator --}}
            @if (is_string($element))
                <li class="page-item disabled" aria-disabled="true"><span class="page-link">{{ $element }}</span></li>
            @endif

            {{-- Array Of Links --}}
            @if (is_array($element))
                @foreach ($element as $page => $url)
                    @if ($page == $paginator->currentPage())
                        <li class="page-item active" aria-current="page"><span class="page-link">{{ $page }}</span></li>
                    @else
                        <li class="page-item"><a class="page-link" href="{{ $url }}">{{ $page }}</a></li>
                    @endif
                @endforeach
            @endif
        @endforeach

        {{-- Next Page Link --}}
        @if ($paginator->hasMorePages())
            <li class="page-item">
                <a class="page-link" href="{{ $paginator->nextPageUrl() }}" rel="next">&raquo;</a>
            </li>
        @else
            <li class="page-item disabled" aria-disabled="true" aria-label="@lang('pagination.next')">
                <span class="page-link" aria-hidden="true">&raquo;</span>
            </li>
        @endif
    </ul>
</nav>
@endif
