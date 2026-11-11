import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { api } from '../services/api';
import { useAuth } from './AuthContext';
import { parseDate } from '../utils/format';

const ColetasContext = createContext(null);

export const ColetasProvider = ({ children }) => {
  const { user } = useAuth();
  const [coletas, setColetas] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const loadedFor = useRef(null);

  const sort = (list) => [...list].sort((a, b) => parseDate(b.DataRegistro) - parseDate(a.DataRegistro));

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!user) return;
      if (silent) setRefreshing(true);
      else setStatus('loading');
      try {
        const data = await api.listColetas(user);
        setColetas(sort(data || []));
        setError(null);
        setStatus('ready');
      } catch (e) {
        setError(e.message);
        if (!silent) setStatus('error');
      } finally {
        setRefreshing(false);
      }
    },
    [user]
  );

  useEffect(() => {
    if (!user) {
      setColetas([]);
      setStatus('idle');
      loadedFor.current = null;
      return;
    }
    if (loadedFor.current !== user.Cadastrarid) {
      loadedFor.current = user.Cadastrarid;
      load();
    }
  }, [user, load]);

  const create = useCallback(async (payload) => {
    const created = await api.createColeta(payload);
    setColetas((list) => sort([created, ...list]));
    return created;
  }, []);

  const update = useCallback(async (coleta, payload) => {
    const updated = await api.updateColeta(coleta, payload);
    setColetas((list) => sort(list.map((c) => (c.Id === updated.Id ? updated : c))));
    return updated;
  }, []);

  const remove = useCallback(async (coleta) => {
    await api.deleteColeta(coleta);
    setColetas((list) => list.filter((c) => c.Id !== coleta.Id));
  }, []);

  const value = useMemo(
    () => ({ coletas, status, error, refreshing, reload: load, refresh: () => load({ silent: true }), create, update, remove }),
    [coletas, status, error, refreshing, load, create, update, remove]
  );
  return <ColetasContext.Provider value={value}>{children}</ColetasContext.Provider>;
};

export const useColetas = () => useContext(ColetasContext);
