import React, { useState } from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import MenuItemCard from '../components/MenuItemCard';
import { useGetMenuItems } from '../hooks/useQueries';

const CATEGORIES = ['All', 'Starters', 'Mains', 'Desserts', 'Drinks', 'Specials'];

export default function MenuPage() {
  const { data: items = [], isLoading, isError } = useGetMenuItems();
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');

  const allCategories = ['All', ...Array.from(new Set(items.map((i) => i.category)))];

  const filtered = items.filter((item) => {
    const matchCat = activeCategory === 'All' || item.category === activeCategory;
    const matchSearch =
      !search ||
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.description.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  const grouped = allCategories
    .filter((c) => c !== 'All')
    .reduce<Record<string, typeof items>>((acc, cat) => {
      const catItems = filtered.filter((i) => i.category === cat);
      if (catItems.length > 0) acc[cat] = catItems;
      return acc;
    }, {});

  return (
    <div>
      {/* Hero Banner */}
      <div className="relative w-full overflow-hidden" style={{ height: '320px' }}>
        <img
          src="/assets/generated/restaurant-hero.dim_1200x400.png"
          alt="La Maison Restaurant"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-burgundy-900/40 via-burgundy-900/20 to-background/80" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
          <h1 className="font-display text-4xl md:text-5xl font-bold text-cream-50 drop-shadow-lg mb-2">
            Our Menu
          </h1>
          <p className="font-body text-cream-200 text-base md:text-lg drop-shadow max-w-md">
            Crafted with passion, served with elegance
          </p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Search */}
        <div className="relative mb-6 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search dishes…"
            className="pl-9 font-body bg-card border-cream-300"
          />
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-2 mb-8">
          {allCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-1.5 rounded-full text-sm font-body font-medium transition-all border ${
                activeCategory === cat
                  ? 'bg-burgundy-600 text-cream-50 border-burgundy-600 shadow-warm'
                  : 'bg-card text-foreground border-cream-300 hover:border-burgundy-400 hover:text-burgundy-600'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Error */}
        {isError && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-body text-sm">
              Failed to load menu. Please try again.
            </AlertDescription>
          </Alert>
        )}

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <Skeleton key={i} className="h-28 rounded-xl" />
            ))}
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && filtered.length === 0 && (
          <div className="text-center py-16">
            <p className="font-display text-xl text-muted-foreground">No dishes found</p>
            <p className="font-body text-sm text-muted-foreground mt-1">
              {search ? 'Try a different search term.' : 'Check back soon for our menu!'}
            </p>
          </div>
        )}

        {/* Menu Sections */}
        {!isLoading && !isError && (
          <div className="space-y-10">
            {activeCategory === 'All'
              ? Object.entries(grouped).map(([cat, catItems]) => (
                  <section key={cat}>
                    <div className="flex items-center gap-3 mb-4">
                      <h2 className="font-display text-2xl font-semibold text-foreground">{cat}</h2>
                      <div className="flex-1 h-px bg-cream-300" />
                      <Badge variant="outline" className="border-gold-400 text-gold-600 font-body text-xs">
                        {catItems.length} {catItems.length === 1 ? 'item' : 'items'}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {catItems.map((item) => (
                        <MenuItemCard key={item.id.toString()} item={item} />
                      ))}
                    </div>
                  </section>
                ))
              : filtered.length > 0 && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {filtered.map((item) => (
                      <MenuItemCard key={item.id.toString()} item={item} />
                    ))}
                  </div>
                )}
          </div>
        )}
      </div>
    </div>
  );
}
