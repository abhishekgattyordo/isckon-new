'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useERP } from '../../context/ERPContext';
import { BarcodeView } from './BarcodeView';
import { Product } from '../../types';
import {
  QrCode,
  Printer,
  Barcode as BarcodeIcon,
  Tag,
  Search,
  CheckCircle2,
  Copy,
  Layers,
  Sparkles,
  Download,
  ChevronDown,
  Check,
  Filter,
  CheckSquare,
  Square
} from 'lucide-react';

interface ProductSearchComboboxProps {
  selectedProductId: string;
  onSelect: (product: Product) => void;
  branchId?: string;
}

const ProductSearchCombobox: React.FC<ProductSearchComboboxProps> = ({
  selectedProductId,
  onSelect,
  branchId
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedProd, setSelectedProd] = useState<Product | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const queryParam = searchTerm.trim() ? `&search=${encodeURIComponent(searchTerm.trim())}` : '';
        const branchParam = branchId && branchId !== '*' ? `&branchId=${branchId}` : '';
        const res = await fetch(`/api/products?limit=8${queryParam}${branchParam}`).then(r => r.json());
        if (res.success && Array.isArray(res.products)) {
          setResults(res.products.slice(0, 8));
        } else {
          setResults([]);
        }
      } catch (err) {
        setResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [searchTerm, isOpen, branchId]);

  return (
    <div ref={dropdownRef} className="relative w-full">
      <button
        type="button"
        onClick={() => {
          setIsOpen(!isOpen);
          setTimeout(() => inputRef.current?.focus(), 50);
        }}
        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs sm:text-sm font-mono text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500 cursor-pointer"
      >
        <div className="flex items-center gap-2 min-w-0 text-left">
          <Tag className="w-4 h-4 text-rose-500 shrink-0" />
          <span className="truncate">
            {selectedProd ? `${selectedProd.sku} — ${selectedProd.name} (₹${Number(selectedProd.price).toFixed(2)})` : 'Search & select product SKU...'}
          </span>
        </div>
        <ChevronDown className={`w-4 h-4 text-slate-400 shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute left-0 right-0 top-full mt-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in-50 zoom-in-95 duration-150">
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/90 dark:bg-slate-950/80 flex items-center gap-2">
            <Search className="w-4 h-4 text-slate-400 shrink-0" />
            <input
              ref={inputRef}
              type="text"
              placeholder="Type product name, SKU, or category..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="w-full bg-transparent text-xs sm:text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none font-mono"
            />
            {isLoading && <span className="text-[10px] font-mono text-rose-500 animate-pulse shrink-0">Searching...</span>}
          </div>

          <div className="max-h-64 overflow-y-auto divide-y divide-slate-100 dark:divide-slate-800/60 p-1.5">
            {results.length > 0 ? (
              results.map(p => {
                const isSelected = p.id === selectedProductId;
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedProd(p);
                      onSelect(p);
                      setIsOpen(false);
                      setSearchTerm('');
                    }}
                    className={`p-2.5 rounded-xl cursor-pointer transition-colors flex items-center justify-between text-xs ${
                      isSelected
                        ? 'bg-rose-50 dark:bg-rose-950/50 text-rose-700 dark:text-rose-300 font-bold border border-rose-200 dark:border-rose-800'
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="min-w-0 pr-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-rose-600 dark:text-rose-400">{p.sku}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-slate-500">{p.category}</span>
                      </div>
                      <p className="truncate font-semibold mt-0.5">{p.name}</p>
                    </div>
                    <div className="text-right shrink-0 font-mono">
                      <span className="font-bold">₹{Number(p.price).toFixed(2)}</span>
                      <p className="text-[10px] text-slate-400">{p.stock} in stock</p>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="p-6 text-center text-xs text-slate-400">
                <p>No matching products found for "{searchTerm}"</p>
                <span className="text-[10px] text-slate-500 mt-1 block font-mono">Try searching by SKU or product title</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export const BarcodeManager: React.FC = () => {
  const { products, barcodes, addBarcodeRecord, quickNotification, settings, currentBranch } = useERP();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(products[0] || null);
  const [stickerType, setStickerType] = useState<'standard' | 'shelf' | 'jewel'>('standard');
  const [printCount, setPrintCount] = useState(24);
  const [customSerial, setCustomSerial] = useState('ISK-2026-8849');
  const [isPrinting, setIsPrinting] = useState(false);

  // New states for category filtering, unprinted items, and bulk selection
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const [unprintedOnly, setUnprintedOnly] = useState<boolean>(false);
  const [searchFilter, setSearchFilter] = useState<string>('');
  const [selectedBulkIds, setSelectedBulkIds] = useState<string[]>([]);

  const categories = ['All', ...Array.from(new Set(products.map(p => p.category)))];

  // Helper to check if a product has been printed (exists in barcodes records)
  const isProductPrinted = (sku: string) => {
    return barcodes.some(b => b.sku.toLowerCase() === sku.toLowerCase());
  };

  // Filtered products list for bulk view
  const filteredCatalogProducts = products.filter(p => {
    if (!p) return false;
    const matchesCat = selectedCategoryFilter === 'All' || p.category === selectedCategoryFilter;
    const matchesSearch = searchFilter.trim() === '' ||
      p.name.toLowerCase().includes(searchFilter.toLowerCase()) ||
      p.sku.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (p.barcode && p.barcode.includes(searchFilter));
    const isUnprinted = unprintedOnly ? !isProductPrinted(p.sku) : true;
    return matchesCat && matchesSearch && isUnprinted;
  });

  const selectedProd = selectedProduct || products[0] || {
    id: 'prod-fallback',
    sku: 'SKU-001',
    name: 'Devotional Book Item',
    price: 350,
    cost: 200,
    stock: 100,
    minStock: 10,
    warehouseZone: 'Main Warehouse',
    batchNo: 'ISK-2026-001',
    barcode: '8901234002039',
    category: 'Books & Scriptures',
    status: 'in_stock',
    lastUpdated: new Date().toISOString()
  };

  useEffect(() => {
    if (selectedProd && selectedProd.batchNo) {
      setCustomSerial(selectedProd.batchNo);
    }
  }, [selectedProd?.id]);

  const handlePrint = () => {
    setIsPrinting(true);
    addBarcodeRecord({
      sku: selectedProd?.sku || 'SKU-001',
      barcodeValue: selectedProd?.barcode || '1234567890123',
      productName: selectedProd?.name || 'Devotional Book Item',
      format: 'code128',
      template: (stickerType === 'standard' ? 'retail_tag_1x2' : stickerType === 'shelf' ? 'shelf_label_2x3' : 'jewelry_hangtag'),
      generatedAt: new Date().toISOString(),
      batchNo: customSerial,
      printCount: printCount
    });

    setTimeout(() => {
      setIsPrinting(false);
      quickNotification('Stickers Dispatched', `Sent ${printCount} barcode tags (${stickerType.toUpperCase()}) to thermal printer.`, 'success');
      
      const printSection = document.getElementById('print-section');
      if (printSection) {
        const printClone = printSection.cloneNode(true) as HTMLElement;
        printClone.id = 'print-section-active';
        printClone.classList.remove('hidden');
        printClone.classList.add('active-print-element');
        document.body.appendChild(printClone);
        
        document.body.classList.add('print-labels-only');
        
        const pageStyle = document.createElement('style');
        pageStyle.id = 'dynamic-print-page-style';
        pageStyle.innerHTML = `@page { size: auto; margin: 3mm; }`;
        document.head.appendChild(pageStyle);
        
        window.print();
        
        setTimeout(() => {
          printClone.remove();
          document.body.classList.remove('print-labels-only');
          const pStyle = document.getElementById('dynamic-print-page-style');
          if (pStyle) pStyle.remove();
        }, 500);
      } else {
        window.print();
      }
    }, 1000);
  };

  const handleBulkPrint = () => {
    const itemsToPrint = filteredCatalogProducts.filter(p => selectedBulkIds.includes(p.id));
    if (itemsToPrint.length === 0) {
      quickNotification('Selection Required', 'Please select at least one product from the catalog list for bulk printing.', 'alert');
      return;
    }

    setIsPrinting(true);
    itemsToPrint.forEach(p => {
      addBarcodeRecord({
        sku: p.sku,
        barcodeValue: p.barcode || '8901234002039',
        productName: p.name,
        format: 'code128',
        template: (stickerType === 'standard' ? 'retail_tag_1x2' : stickerType === 'shelf' ? 'shelf_label_2x3' : 'jewelry_hangtag'),
        generatedAt: new Date().toISOString(),
        batchNo: p.batchNo || customSerial,
        printCount: 12
      });
    });

    setTimeout(() => {
      setIsPrinting(false);
      quickNotification('Bulk Sheets Dispatched', `Generated printable barcode label sheets for ${itemsToPrint.length} products.`, 'success');

      const bulkPrintSection = document.getElementById('bulk-print-section');
      if (bulkPrintSection) {
        const clone = bulkPrintSection.cloneNode(true) as HTMLElement;
        clone.id = 'bulk-print-active';
        clone.classList.remove('hidden');
        clone.classList.add('active-print-element');
        document.body.appendChild(clone);
        document.body.classList.add('print-labels-only');

        window.print();

        setTimeout(() => {
          clone.remove();
          document.body.classList.remove('print-labels-only');
        }, 500);
      } else {
        window.print();
      }
    }, 1000);
  };

  const toggleSelectAll = () => {
    if (selectedBulkIds.length === filteredCatalogProducts.length) {
      setSelectedBulkIds([]);
    } else {
      setSelectedBulkIds(filteredCatalogProducts.map(p => p.id));
    }
  };

  const toggleBulkItem = (id: string) => {
    if (selectedBulkIds.includes(id)) {
      setSelectedBulkIds(selectedBulkIds.filter(i => i !== id));
    } else {
      setSelectedBulkIds([...selectedBulkIds, id]);
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto font-sans">
      {/* Header */}
      <div className="pb-4 border-b border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <QrCode className="w-6 h-6 text-rose-500 shrink-0" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Barcode & Label Sticker Generator
            </h1>
            <span className="px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 font-mono text-[10px] font-bold border border-rose-500/20">
              CODE-128 & QR READY
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            THERMAL STICKER EXPORT • SHELF LABELS • BULK PRINTING • UNPRINTED FILTER
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Controls (6 Cols) */}
        <div className="lg:col-span-6 space-y-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
            <h2 className="font-bold text-base text-slate-900 dark:text-white font-display flex items-center gap-2">
              <Tag className="w-4 h-4 text-rose-500" />
              <span>1. Select Merchandise SKU</span>
            </h2>

            <div className="space-y-2">
              <label className="text-[11px] font-mono font-bold text-slate-400 uppercase">Product Catalog Target</label>
              <ProductSearchCombobox
                selectedProductId={selectedProd.id}
                onSelect={(p) => setSelectedProduct(p)}
                branchId={currentBranch?.id}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-slate-400 uppercase">Barcode Value</label>
                <input
                  type="text"
                  readOnly
                  value={selectedProd?.barcode || '88491029384'}
                  className="w-full px-3 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-xs font-mono font-bold text-slate-600 dark:text-slate-300 border border-transparent"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[11px] font-mono font-bold text-slate-400 uppercase">Custom Prefix / Batch</label>
                <input
                  type="text"
                  value={customSerial}
                  onChange={e => setCustomSerial(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
                />
              </div>
            </div>

            <div className="space-y-3 pt-3 border-t border-slate-100 dark:border-slate-800">
              <h3 className="font-bold text-xs font-mono text-slate-400 uppercase">2. Sticker Dimensions & Format</h3>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'standard', name: '1" x 2" Standard Tag', desc: 'Books & Apparel' },
                  { id: 'shelf', name: '2" x 4" Shelf Label', desc: 'Aisle Headers' },
                  { id: 'jewel', name: '0.5" x 1.5" Mini Tag', desc: 'Japa Mala & Beads' },
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => setStickerType(type.id as any)}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      stickerType === type.id
                        ? 'bg-rose-500/10 border-rose-500 text-rose-600 dark:text-rose-400 font-bold shadow-sm'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-100'
                    }`}
                  >
                    <span className="text-xs font-bold font-mono">{type.name}</span>
                    <span className="text-[10px] text-slate-400 mt-1">{type.desc}</span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-mono font-bold text-slate-400 uppercase">3. Quantity to Print</label>
                <span className="font-mono font-bold text-rose-500 text-sm">{printCount} stickers</span>
              </div>
              <input
                type="range"
                min="4"
                max="100"
                step="4"
                value={printCount}
                onChange={e => setPrintCount(Number(e.target.value))}
                className="w-full accent-rose-500 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-400">
                <span>4 (1 row)</span>
                <span>24 (1 sheet)</span>
                <span>100 (bulk roll)</span>
              </div>
            </div>

            <button
              onClick={handlePrint}
              disabled={isPrinting}
              className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-rose-600 to-rose-500 hover:from-rose-500 hover:to-rose-600 text-white font-bold text-xs tracking-wider uppercase shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all active:scale-98 disabled:opacity-50"
            >
              {isPrinting ? (
                <>
                  <Sparkles className="w-4 h-4 animate-spin" />
                  <span>Generating Thermal Print Stream...</span>
                </>
              ) : (
                <>
                  <Printer className="w-4 h-4" />
                  <span>Print {printCount} Labels Now</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Preview (6 Cols) */}
        <div className="lg:col-span-6 sticky top-6">
          <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold text-slate-400 uppercase">Live Print Sheet Preview</span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold">
                DPI: 300 THERMAL
              </span>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-dashed border-slate-300 dark:border-slate-700 grid grid-cols-2 gap-3 max-h-[420px] overflow-y-auto">
              {Array.from({ length: Math.min(4, printCount) }).map((_, idx) => (
                <div key={idx} className="bg-white dark:bg-slate-900 p-3 rounded-lg border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between space-y-2">
                  <div className="flex justify-between items-center text-[10px] font-mono font-bold text-slate-600 dark:text-slate-300">
                    <span>{settings.orgName || 'ISKCON FOUNDATION'}</span>
                    <span className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded">₹{Number(selectedProd.price).toFixed(2)}</span>
                  </div>
                  <p className="text-xs font-bold text-slate-900 dark:text-white truncate">{selectedProd.name}</p>
                  <div className="py-1 flex justify-center">
                    <BarcodeView value={selectedProd.barcode || '8901234002039'} width={1.2} height={34} fontSize={10} />
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <span>SKU: {selectedProd.sku}</span>
                    <span>BATCH: {customSerial}</span>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[11px] text-center text-slate-400 font-mono">
              + {Math.max(0, printCount - 4)} additional identical stickers ready on sheet...
            </p>
          </div>
        </div>
      </div>

      {/* Category Filtering & Bulk Printing Section */}
      <div className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
              <Layers className="w-5 h-5 text-rose-500" />
              <span>Category Filtering & Unprinted Items Bulk Print</span>
            </h2>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Filter products by category (e.g. Sandalwood, Books) and highlight items lacking printed barcode labels for batch generation.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleBulkPrint}
              disabled={selectedBulkIds.length === 0 || isPrinting}
              className="px-4 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-md shadow-rose-500/20 cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Bulk Print Label Sheets ({selectedBulkIds.length})</span>
            </button>
          </div>
        </div>

        {/* Filter Toolbar */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          <div className="md:col-span-4 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
            <input
              type="text"
              placeholder="Search catalog by title, SKU, barcode..."
              value={searchFilter}
              onChange={e => setSearchFilter(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
            />
          </div>

          <div className="md:col-span-3 flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={selectedCategoryFilter}
              onChange={e => setSelectedCategoryFilter(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-slate-900 dark:text-white focus:outline-none"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat === 'All' ? 'All Categories (Sandalwood, Books, etc.)' : cat}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-5 flex items-center justify-between md:justify-end gap-3">
            <label className="flex items-center gap-2 px-3 py-2 bg-amber-500/10 border border-amber-500/30 rounded-xl cursor-pointer">
              <input
                type="checkbox"
                checked={unprintedOnly}
                onChange={e => setUnprintedOnly(e.target.checked)}
                className="accent-rose-500 w-4 h-4 rounded"
              />
              <span className="text-xs font-mono font-bold text-amber-700 dark:text-amber-300">Highlight Unprinted Items Only</span>
            </label>

            <button
              onClick={toggleSelectAll}
              className="text-xs font-mono text-rose-600 dark:text-rose-400 hover:underline px-2 py-1"
            >
              {selectedBulkIds.length === filteredCatalogProducts.length ? 'Deselect All' : 'Select All Filtered'}
            </button>
          </div>
        </div>

        {/* Catalog Table */}
        <div className="border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden">
          <div className="max-h-96 overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead className="bg-slate-50 dark:bg-slate-950 text-[10px] font-mono uppercase text-slate-400 sticky top-0 border-b border-slate-200 dark:border-slate-800">
                <tr>
                  <th className="p-3 w-10 text-center">
                    <input
                      type="checkbox"
                      checked={selectedBulkIds.length > 0 && selectedBulkIds.length === filteredCatalogProducts.length}
                      onChange={toggleSelectAll}
                      className="accent-rose-500 w-4 h-4 rounded"
                    />
                  </th>
                  <th className="p-3">SKU & Product Name</th>
                  <th className="p-3">Category</th>
                  <th className="p-3">Barcode</th>
                  <th className="p-3">Price</th>
                  <th className="p-3">Label Print Status</th>
                  <th className="p-3 text-right">Quick Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 text-xs">
                {filteredCatalogProducts.length > 0 ? (
                  filteredCatalogProducts.map(p => {
                    const printed = isProductPrinted(p.sku);
                    const isChecked = selectedBulkIds.includes(p.id);
                    return (
                      <tr key={p.id} className={`hover:bg-slate-50/80 dark:hover:bg-slate-800/40 ${isChecked ? 'bg-rose-50/40 dark:bg-rose-950/20' : ''}`}>
                        <td className="p-3 text-center">
                          <input
                            type="checkbox"
                            checked={isChecked}
                            onChange={() => toggleBulkItem(p.id)}
                            className="accent-rose-500 w-4 h-4 rounded"
                          />
                        </td>
                        <td className="p-3">
                          <div className="font-mono font-bold text-rose-600 dark:text-rose-400">{p.sku}</div>
                          <div className="font-semibold text-slate-900 dark:text-white">{p.name}</div>
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 font-mono text-[10px] text-slate-600 dark:text-slate-300">
                            {p.category}
                          </span>
                        </td>
                        <td className="p-3 font-mono text-slate-600 dark:text-slate-300">{p.barcode || '—'}</td>
                        <td className="p-3 font-mono font-bold">₹{Number(p.price).toFixed(2)}</td>
                        <td className="p-3">
                          {printed ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 text-[10px] font-mono font-bold">
                              <CheckCircle2 className="w-3 h-3" /> Printed
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 text-[10px] font-mono font-bold">
                              ⚠️ Unprinted Label
                            </span>
                          )}
                        </td>
                        <td className="p-3 text-right">
                          <button
                            onClick={() => {
                              setSelectedProduct(p);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                            className="px-2.5 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-rose-500 hover:text-white rounded-lg text-slate-700 dark:text-slate-300 text-[11px] font-mono transition-colors"
                          >
                            Configure & Print
                          </button>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-slate-400 text-xs">
                      No matching products found for category "{selectedCategoryFilter}" {unprintedOnly ? '(Unprinted only)' : ''}.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Hidden Print Section for Single Label Print */}
      <div id="print-section" className="hidden">
        <div className="p-4 grid grid-cols-2 gap-4 max-w-[800px] mx-auto">
          {Array.from({ length: printCount }).map((_, idx) => (
            <div key={idx} className="bg-white p-4 border border-black rounded flex flex-col justify-between space-y-2 page-break-inside-avoid">
              <div className="flex justify-between items-center text-xs font-mono font-bold text-black">
                <span>{settings.orgName || 'ISKCON FOUNDATION'}</span>
                <span>₹{Number(selectedProd.price).toFixed(2)}</span>
              </div>
              <p className="text-sm font-bold text-black">{selectedProd.name}</p>
              <div className="py-2 flex justify-center">
                <BarcodeView value={selectedProd.barcode || '8901234002039'} width={1.5} height={40} fontSize={11} />
              </div>
              <div className="flex justify-between items-center text-[10px] font-mono text-black pt-1 border-t border-gray-300">
                <span>SKU: {selectedProd.sku}</span>
                <span>BATCH: {customSerial}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Hidden Bulk Print Section */}
      <div id="bulk-print-section" className="hidden">
        <div className="p-4 space-y-6 max-w-[800px] mx-auto">
          {filteredCatalogProducts.filter(p => selectedBulkIds.includes(p.id)).map(p => (
            <div key={p.id} className="grid grid-cols-2 gap-4 page-break-after-always">
              {Array.from({ length: 12 }).map((_, idx) => (
                <div key={idx} className="bg-white p-3 border border-black rounded flex flex-col justify-between space-y-2">
                  <div className="flex justify-between items-center text-xs font-mono font-bold text-black">
                    <span>{settings.orgName || 'ISKCON FOUNDATION'}</span>
                    <span>₹{Number(p.price).toFixed(2)}</span>
                  </div>
                  <p className="text-xs font-bold text-black">{p.name}</p>
                  <div className="py-1 flex justify-center">
                    <BarcodeView value={p.barcode || '8901234002039'} width={1.4} height={36} fontSize={10} />
                  </div>
                  <div className="flex justify-between items-center text-[9px] font-mono text-black pt-1 border-t border-gray-300">
                    <span>SKU: {p.sku}</span>
                    <span>BATCH: {p.batchNo || 'ISK-2026'}</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
