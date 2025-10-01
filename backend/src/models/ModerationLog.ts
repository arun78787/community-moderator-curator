import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../config/database';
import { User } from './User';
import { Flag } from './Flag';

interface ModerationLogAttributes {
  id: string;
  moderator_id: string;
  flag_id: string;
  action: 'approve' | 'remove' | 'escalate';
  notes?: string;
  created_at: Date;
}

interface ModerationLogCreationAttributes extends Optional<ModerationLogAttributes, 'id' | 'created_at'> {}

class ModerationLog extends Model<ModerationLogAttributes, ModerationLogCreationAttributes> implements ModerationLogAttributes {
  public id!: string;
  public moderator_id!: string;
  public flag_id!: string;
  public action!: 'approve' | 'remove' | 'escalate';
  public notes?: string;
  public created_at!: Date;

  // Associations
  public moderator?: User;
  public flag?: Flag;
}

ModerationLog.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    moderator_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    flag_id: {
      type: DataTypes.UUID,
      allowNull: false,
      references: {
        model: Flag,
        key: 'id',
      },
    },
    action: {
      type: DataTypes.ENUM('approve', 'remove', 'escalate'),
      allowNull: false,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'ModerationLog',
    tableName: 'moderation_logs',
    timestamps: false,
  }
);

// Associations
ModerationLog.belongsTo(User, { foreignKey: 'moderator_id', as: 'moderator' });
ModerationLog.belongsTo(Flag, { foreignKey: 'flag_id', as: 'flag' });
User.hasMany(ModerationLog, { foreignKey: 'moderator_id', as: 'moderationActions' });
Flag.hasMany(ModerationLog, { foreignKey: 'flag_id', as: 'moderationLogs' });

export { ModerationLog };