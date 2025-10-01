import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';

interface PostAttributes {
  id: string;
  author_id: string;
  content: string;
  media_url?: string;
  status: 'active' | 'removed' | 'pending';
  created_at: Date;
  updated_at: Date;
}

interface PostCreationAttributes extends Optional<PostAttributes, 'id' | 'created_at' | 'updated_at' | 'status'> {}

class Post extends Model<PostAttributes, PostCreationAttributes> implements PostAttributes {
  public id!: string;
  public author_id!: string;
  public content!: string;
  public media_url?: string;
  public status!: 'active' | 'removed' | 'pending';
  public created_at!: Date;
  public updated_at!: Date;

  // Associations
  public author?: User;
}

Post.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    author_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [1, 2000],
      },
    },
    media_url: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM('active', 'removed', 'pending'),
      allowNull: false,
      defaultValue: 'active',
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
    modelName: 'Post',
    tableName: 'posts',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

// Associations
Post.belongsTo(User, { foreignKey: 'author_id', as: 'author' });
User.hasMany(Post, { foreignKey: 'author_id', as: 'posts' });

export { Post };