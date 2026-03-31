
-- workspace_state table
CREATE TABLE public.workspace_state (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  drafts JSONB NOT NULL DEFAULT '[]'::jsonb,
  batches JSONB NOT NULL DEFAULT '[]'::jsonb,
  analytics JSONB NOT NULL DEFAULT '[]'::jsonb,
  team JSONB NOT NULL DEFAULT '[]'::jsonb,
  api_credentials JSONB NOT NULL DEFAULT '[]'::jsonb,
  import_jobs JSONB NOT NULL DEFAULT '[]'::jsonb,
  recycle_bin JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.workspace_state ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own workspace"
  ON public.workspace_state FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own workspace"
  ON public.workspace_state FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own workspace"
  ON public.workspace_state FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_workspace_state_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

CREATE TRIGGER trg_workspace_state_updated_at
  BEFORE UPDATE ON public.workspace_state
  FOR EACH ROW
  EXECUTE FUNCTION public.update_workspace_state_updated_at();

-- Free poster quota table
CREATE TABLE public.poster_quota (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  period_key TEXT NOT NULL,
  download_count INT NOT NULL DEFAULT 0,
  monthly_limit INT NOT NULL DEFAULT 5,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, period_key)
);

ALTER TABLE public.poster_quota ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can read own quota"
  ON public.poster_quota FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quota"
  ON public.poster_quota FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quota"
  ON public.poster_quota FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id);

-- get_free_poster_quota_status RPC
CREATE OR REPLACE FUNCTION public.get_free_poster_quota_status()
RETURNS TABLE(download_count INT, remaining_count INT, monthly_limit INT, period_key TEXT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID := auth.uid();
  _period_key TEXT := to_char(now(), 'YYYY-MM');
  _limit INT := 5;
  _count INT := 0;
BEGIN
  SELECT pq.download_count INTO _count
  FROM public.poster_quota pq
  WHERE pq.user_id = _user_id AND pq.period_key = _period_key;

  IF NOT FOUND THEN
    _count := 0;
  END IF;

  RETURN QUERY SELECT _count, GREATEST(0, _limit - _count), _limit, _period_key;
END;
$$;

-- consume_free_poster_quota RPC
CREATE OR REPLACE FUNCTION public.consume_free_poster_quota()
RETURNS TABLE(download_count INT, remaining_count INT, monthly_limit INT, period_key TEXT, allowed BOOLEAN)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _user_id UUID := auth.uid();
  _period_key TEXT := to_char(now(), 'YYYY-MM');
  _limit INT := 5;
  _count INT := 0;
  _allowed BOOLEAN := false;
BEGIN
  INSERT INTO public.poster_quota (user_id, period_key, download_count, monthly_limit)
  VALUES (_user_id, _period_key, 0, _limit)
  ON CONFLICT (user_id, period_key) DO NOTHING;

  SELECT pq.download_count INTO _count
  FROM public.poster_quota pq
  WHERE pq.user_id = _user_id AND pq.period_key = _period_key
  FOR UPDATE;

  IF _count < _limit THEN
    _allowed := true;
    _count := _count + 1;
    UPDATE public.poster_quota SET download_count = _count, updated_at = now()
    WHERE user_id = _user_id AND period_key = _period_key;
  ELSE
    _allowed := false;
  END IF;

  RETURN QUERY SELECT _count, GREATEST(0, _limit - _count), _limit, _period_key, _allowed;
END;
$$;

-- submit_enterprise_request RPC
CREATE OR REPLACE FUNCTION public.submit_enterprise_request(request_source TEXT DEFAULT 'unknown')
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- placeholder: log or store enterprise interest
  RETURN;
END;
$$;
