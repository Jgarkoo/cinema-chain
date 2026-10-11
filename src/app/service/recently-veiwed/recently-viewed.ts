import { effect, inject, Injectable, PLATFORM_ID, signal } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { LogInOut } from '../log-in-out/log-in-out';
import { Movie } from '../../interface/movie';

export interface RecentMovie {
  id: number;
  slug: string;
  title: string;
  imageUrl: string;
  genre: string;
  runtimeMinutes: number;
  minAge: number | string;
}

const MAX_ITEMS = 6;
type UserId = string | number;

@Injectable({ providedIn: 'root' })
export class RecentlyViewed {
  private auth = inject(LogInOut);
  private isBrowser = isPlatformBrowser(inject(PLATFORM_ID));

  private _items = signal<RecentMovie[]>([]);
  readonly items = this._items.asReadonly();

  constructor() {
    effect(() => {
      this._items.set(this.load(this.auth.user()?.id));
    });
  }

  add(movie: Movie): void {
    const userId = this.auth.user()?.id;
    if (userId == null) return; // only tracked for logged-in users

    const entry = this.toRecent(movie);
    const next = [entry, ...this._items().filter((m) => m.id !== entry.id)].slice(0, MAX_ITEMS);

    this._items.set(next);
    this.save(userId, next);
  }

  private toRecent(m: Movie): RecentMovie {
    return {
      id: m.id,
      slug: m.slug,
      title: m.title,
      imageUrl: m.backdropUrl,
      genre: m.genres?.[0]?.name ?? '',
      runtimeMinutes: m.runtimeMinutes,
      minAge: m.ageRating.minAge,
    };
  }

  private key(userId: UserId): string {
    return `recentlyViewed:${userId}`;
  }

  private load(userId?: UserId): RecentMovie[] {
    if (!this.isBrowser || userId == null) return [];
    try {
      const raw = localStorage.getItem(this.key(userId));
      return raw ? (JSON.parse(raw) as RecentMovie[]) : [];
    } catch {
      return [];
    }
  }

  private save(userId: UserId, items: RecentMovie[]): void {
    if (!this.isBrowser) return;
    try {
      localStorage.setItem(this.key(userId), JSON.stringify(items));
    } catch {
    }
  }
}
