import { 
    Table, 
    Column, 
    Model, 
    DataType, 
    Default 
} from 'sequelize-typescript';

@Table({
    tableName: 'stock',
    timestamps: true, // createdAt, updatedAt
})
class Stock extends Model {
    @Column({
        type: DataType.INTEGER,
        allowNull: false
    })
    declare product_id: number;

    @Default(DataType.NOW) 
    @Column({
        type: DataType.DATE,
        allowNull: false
    })
    declare transaction_date: Date;

    @Column({
        type: DataType.FLOAT,
        allowNull: false,
        validate: {
            min: 0 // No puede ser negativo
        }
    })
    declare quantity: number;

    @Column({
        type: DataType.INTEGER,
        allowNull: false,
        validate: {
            isIn: [[1, 2]] // 1: entrada, 2: salida
        }
    })
    declare input_output: number;
}

export default Stock;
