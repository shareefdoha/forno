import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import * as api from '../api/menu';

export const menuKeys = {
  categories: (opts = {}) => ['categories', opts],
  items: (opts = {}) => ['menu_items', opts],
};

/* ─────────────────────────────── reads ─────────────────────────────── */

export function useCategories({ onlyActive = true } = {}) {
  return useQuery({
    queryKey: menuKeys.categories({ onlyActive }),
    queryFn: () => api.fetchCategories({ onlyActive }),
    staleTime: 5 * 60 * 1000,
  });
}

export function useMenuItems({ categoryId = null } = {}) {
  return useQuery({
    queryKey: menuKeys.items({ categoryId }),
    queryFn: () => api.fetchMenuItems({ categoryId }),
    staleTime: 5 * 60 * 1000,
  });
}

/* ────────────────────────────── writes ────────────────────────────── */

function useInvalidateMenu() {
  const qc = useQueryClient();
  return () => {
    qc.invalidateQueries({ queryKey: ['menu_items'] });
    qc.invalidateQueries({ queryKey: ['categories'] });
  };
}

export function useCreateItem() {
  const invalidate = useInvalidateMenu();
  return useMutation({ mutationFn: api.createMenuItem, onSuccess: invalidate });
}

export function useUpdateItem() {
  const invalidate = useInvalidateMenu();
  return useMutation({
    mutationFn: ({ id, payload }) => api.updateMenuItem(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteItem() {
  const invalidate = useInvalidateMenu();
  return useMutation({ mutationFn: api.deleteMenuItem, onSuccess: invalidate });
}

export function useToggleEnabled() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isEnabled }) => api.setItemEnabled(id, isEnabled),
    // Optimistic flip so the switch feels instant in the dashboard.
    onMutate: async ({ id, isEnabled }) => {
      await qc.cancelQueries({ queryKey: ['menu_items'] });
      const snapshots = qc.getQueriesData({ queryKey: ['menu_items'] });
      snapshots.forEach(([key, rows]) => {
        if (!Array.isArray(rows)) return;
        qc.setQueryData(
          key,
          rows.map((r) => (r.id === id ? { ...r, is_enabled: isEnabled } : r)),
        );
      });
      return { snapshots };
    },
    onError: (_err, _vars, ctx) => {
      ctx?.snapshots?.forEach(([key, rows]) => qc.setQueryData(key, rows));
    },
    onSettled: () => qc.invalidateQueries({ queryKey: ['menu_items'] }),
  });
}

export function useCreateCategory() {
  const invalidate = useInvalidateMenu();
  return useMutation({ mutationFn: api.createCategory, onSuccess: invalidate });
}

export function useUpdateCategory() {
  const invalidate = useInvalidateMenu();
  return useMutation({
    mutationFn: ({ id, payload }) => api.updateCategory(id, payload),
    onSuccess: invalidate,
  });
}

export function useDeleteCategory() {
  const invalidate = useInvalidateMenu();
  return useMutation({ mutationFn: api.deleteCategory, onSuccess: invalidate });
}
