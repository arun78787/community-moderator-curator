import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { Post } from './Post';

interface AIAnalysisAttributes {
  id: string;
  post_id: string;
  type: 'text' | 'image';
  raw_response: object;
  labels: string[];
  scores: object;
  overall_risk: number;
  created_at: Date;
}

interface AIAnalysisCreationAttributes extends Optional<AIAnalysisAttributes, 'id' | 'created_at'> {}

class AIAnalysis extends Model<AIAnalysisAttributes, AIAnalysisCreationAttributes> implements AIAnalysisAttributes {
  public id!: string;
  public post_id!: string;
  public type!: 'text' | 'image';
  public raw_response!: object;
  public labels!: string[];
  public scores!: object;
  public overall_risk!: number;
  public created_at!: Date;

  // Associations
  public post?: Post;
}

AIAnalysis.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    post_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Post,
        key: 'id',
      },
    },
    type: {
      type: DataTypes.ENUM('text', 'image'),
      allowNull: false,
    },
    raw_response: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    labels: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      defaultValue: [],
    },
    scores: {
      type: DataTypes.JSONB,
      allowNull: false,
    },
    overall_risk: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 1,
      },
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'AIAnalysis',
    tableName: 'ai_analysis',
    timestamps: false,
  }
);

// Associations
AIAnalysis.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });
Post.hasMany(AIAnalysis, { foreignKey: 'post_id', as: 'aiAnalyses' });

export { AIAnalysis };