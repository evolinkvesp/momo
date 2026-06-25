CREATE TABLE IF NOT EXISTS referral_invites (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id  uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  invited_id   uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  criado_em    timestamptz DEFAULT now(),
  UNIQUE(invited_id)
);

ALTER TABLE referral_invites ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Referrer ve seus convites" ON referral_invites
  FOR SELECT USING (auth.uid() = referrer_id);
