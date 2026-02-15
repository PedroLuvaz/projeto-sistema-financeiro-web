const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  const MembroFamilia = sequelize.define('MembroFamilia', {
    Id_Membro: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
      field: 'id_membro'
    },
    Id_Usuario: {
      type: DataTypes.UUID,
      allowNull: false,
      field: 'id_usuario',
      references: {
        model: 'usuario',
        key: 'id_usuario'
      }
    },
    Nome_Membro: {
      type: DataTypes.STRING(100),
      allowNull: false,
      field: 'nome_membro'
    },
    Parentesco: {
      type: DataTypes.STRING(50),
      allowNull: true,
      field: 'parentesco'
    }
  }, {
    tableName: 'membro_familia',
    timestamps: false,
    underscored: true
  });

  MembroFamilia.associate = (models) => {
    MembroFamilia.belongsTo(models.Usuario, {
      foreignKey: 'Id_Usuario',
      as: 'usuario',
      onDelete: 'CASCADE'
    });
  };

  return MembroFamilia;
};
