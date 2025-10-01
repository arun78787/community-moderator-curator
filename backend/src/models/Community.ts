import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';

interface CommunityAttributes {
  id: string;
  name: string;
  description?: string;
  rules: object;
  created_at: Date;
  updated_at: Date;
}

interface CommunityCreationAttributes extends Optional<CommunityAttributes, 'id' | 'created_at' | 'updated_at'> {}

class Community extends Model<CommunityAttributes, CommunityCreationAttributes> implements CommunityAttributes {
  public id!: string;
  public name!: string;
  public description?: string;
  public rules!: object;
  public created_at!: Date;
  public updated_at!: Date;
}

Community.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    rules: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: {
        auto_remove_threshold: 0.9,
        flag_review_threshold: 0.6,
        allowed_categories: ['spam', 'harassment', 'hate-speech', 'violence', 'nudity', 'misinformation', 'copyright', 'other'],
        max_post_length: 2000,
        allow_anonymous_posts: false,
        require_approval: false
      },
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Community',
    tableName: 'communities',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export { Community };