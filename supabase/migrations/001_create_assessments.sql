-- Create assessments table
CREATE TABLE assessments (
  id         uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name       text NOT NULL DEFAULT 'Untitled Assessment',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Create agent_scores table
CREATE TABLE agent_scores (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  assessment_id  uuid NOT NULL REFERENCES assessments(id) ON DELETE CASCADE,
  agent_id       text NOT NULL,
  agent_name     text NOT NULL,
  dimension      text NOT NULL CHECK (dimension IN ('data', 'infrastructure', 'people', 'process', 'strategy', 'governance')),
  score          integer NOT NULL CHECK (score BETWEEN 1 AND 5),
  created_at     timestamptz NOT NULL DEFAULT now(),
  UNIQUE (assessment_id, agent_id, dimension)
);

-- Indexes
CREATE INDEX idx_assessments_user_id ON assessments(user_id);
CREATE INDEX idx_agent_scores_assessment_id ON agent_scores(assessment_id);

-- Enable RLS
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_scores ENABLE ROW LEVEL SECURITY;

-- Assessments: users can only access their own rows
CREATE POLICY "Users can view own assessments"
  ON assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create own assessments"
  ON assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own assessments"
  ON assessments FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own assessments"
  ON assessments FOR DELETE
  USING (auth.uid() = user_id);

-- Agent scores: access controlled via assessment ownership
CREATE POLICY "Users can view own agent scores"
  ON agent_scores FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM assessments WHERE assessments.id = agent_scores.assessment_id AND assessments.user_id = auth.uid()
  ));

CREATE POLICY "Users can create own agent scores"
  ON agent_scores FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM assessments WHERE assessments.id = agent_scores.assessment_id AND assessments.user_id = auth.uid()
  ));

CREATE POLICY "Users can update own agent scores"
  ON agent_scores FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM assessments WHERE assessments.id = agent_scores.assessment_id AND assessments.user_id = auth.uid()
  ))
  WITH CHECK (EXISTS (
    SELECT 1 FROM assessments WHERE assessments.id = agent_scores.assessment_id AND assessments.user_id = auth.uid()
  ));

CREATE POLICY "Users can delete own agent scores"
  ON agent_scores FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM assessments WHERE assessments.id = agent_scores.assessment_id AND assessments.user_id = auth.uid()
  ));

-- Auto-update updated_at on assessments
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER assessments_updated_at
  BEFORE UPDATE ON assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
