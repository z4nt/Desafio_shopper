import { DataTypes, Sequelize } from 'sequelize';

const sequelize = new Sequelize('postgres', 'postgres', '1234', {
  host: 'localhost',
  dialect: 'postgres',
});

export const LeituraResposta = sequelize.define("LeituraResposta", {
  measure_uuid: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
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
  measure_type: {
    type: DataTypes.TEXT,
    allowNull: false,
  },
  image_url: {
    type: DataTypes.TEXT,
    allowNull: false,
  }
});

// sequelize.sync({ force: true });
sequelize.sync();

async function executeAuthentication() {
  try {
    await sequelize.authenticate();
    console.log("Connection has been established successfully.");
  } catch (error) {
    console.error("Unable to connect to the database:", error);
  }
}

executeAuthentication();
