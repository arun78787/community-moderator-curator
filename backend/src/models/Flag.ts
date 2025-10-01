import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';
import { Post } from './Post';

interface FlagAttributes {
  id: string;
  post_id: string;
  flagged_by: string;
  reason_category: 'spam' | 'harassment' | 'hate-speech' | 'violence' | 'nudity' | 'misinformation' | 'copyright' | 'other';
  reason_text?: string;
  status: 'pending' | 'approved' | 'removed' | 'escalated';
  created_at: Date;
  updated_at: Date;
}

interface FlagCreationAttributes extends Optional<FlagAttributes, 'id' | 'created_at' | 'updated_at' | 'status'> {}

class Flag extends Model<FlagAttributes, FlagCreationAttributes> implements FlagAttributes {
  public id!: string;
  public post_id!: string;
  public flagged_by!: string;
  public reason_category!: 'spam' | 'harassment' | 'hate-speech' | 'violence' | 'nudity' | 'misinformation' | 'copyright' | 'other';
  public reason_text?: string;
  public status!: 'pending' | 'approved' | 'removed' | 'escalated';
  public created_at!: Date;
  public updated_at!: Date;

  // Associations
  public post?: Post;
  public flaggedBy?: User;
}

Flag.init(
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
    flagged_by: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    reason_category: {
      type: DataTypes.ENUM('spam', 'harassment', 'hate-speech', 'violence', 'nudity', 'misinformation', 'copyright', 'other'),
      allowNull: false,
    },
    reason_text: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('pending', 'approved', 'removed', 'escalated'),
      allowNull: false,
      defaultValue: 'pending',
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
    modelName: 'Flag',
    tableName: 'flags',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Associations
Flag.belongsTo(Post, { foreignKey: 'post_id', as: 'post' });
Flag.belongsTo(User, { foreignKey: 'flagged_by', as: 'flaggedBy' });
Post.hasMany(Flag, { foreignKey: 'post_id', as: 'flags' });
User.hasMany(Flag, { foreignKey: 'flagged_by', as: 'flagsCreated' });

export { Flag };