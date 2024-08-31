import { DataTypes, Sequelize } from 'sequelize';

const sequelize = new Sequelize('postgres', 'postgres', '1234', {
  host: 'localhost',
  dialect: 'postgres',
});

export const Cliente = sequelize.define("Cliente", {
  customer_code: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  resposta: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  confirmed_value: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
});

export const Measures = sequelize.define("Measures", {
  measure_uuid: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  Measure_Datetime: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  measure_type: {
    type: DataTypes.INTEGER,
    allowNull: true,
  },
  image_url: {
    type: DataTypes.TEXT,
    allowNull: true,
  },
  has_confirmed: {
    type: DataTypes.BOOLEAN,
    allowNull: true},
  cliente_id: {
    type: DataTypes.INTEGER,
    references: {
      model: Cliente, 
      key: 'id', 
      },
    }
});

Cliente.hasMany(Measures, { foreignKey: "cliente_id" });
Measures.belongsTo(Cliente, { foreignKey: "cliente_id" });
sequelize.sync({ force: true });
// sequelize.sync();

async function executeAuthentication() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

executeAuthentication();
