import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import bcrypt from 'bcryptjs';

interface UserAttributes {
  id: string;
  email: string;
  name: string;
  role: 'user' | 'moderator' | 'admin';
  password_hash?: string;
  oauth_provider?: string;
  oauth_id?: string;
  reputation_score: number;
  created_at: Date;
  updated_at: Date;
}

interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'created_at' | 'updated_at' | 'reputation_score'> {}

class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: string;
  public email!: string;
  public name!: string;
  public role!: 'user' | 'moderator' | 'admin';
  public password_hash?: string;
  public oauth_provider?: string;
  public oauth_id?: string;
  public reputation_score!: number;
  public created_at!: Date;
  public updated_at!: Date;

  // Instance methods
  public async validatePassword(password: string): Promise<boolean> {
    if (!this.password_hash) return false;
    return bcrypt.compare(password, this.password_hash);
  }

  public async setPassword(password: string): Promise<void> {
    const salt = await bcrypt.genSalt(12);
    this.password_hash = await bcrypt.hash(password, salt);
  }

  public toJSON() {
    const values = { ...this.get() };
    delete values.password_hash;
    return values;
  }
}

User.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        len: [2, 100],
      },
    },
    role: {
      type: DataTypes.ENUM('user', 'moderator', 'admin'),
      allowNull: false,
      defaultValue: 'user',
    },
    password_hash: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    oauth_provider: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    oauth_id: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    reputation_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
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
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
  }
);

export { User };