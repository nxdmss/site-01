import React, { Component } from 'react'
import { FaTrash, FaPlus, FaMinus } from 'react-icons/fa'

export class Orders extends Component {
  constructor(props) {
    super(props);
    this.state = {
      quantity: this.props.item.quantity
    }
  }

  handleQuantityChange = (e) => {
    const value = parseInt(e.target.value) || 0;
    if (value > 0) {
      this.setState({ quantity: value });
      this.props.item.quantity = value;
      this.props.onQuantityChange(this.props.item.id, value);
    }
  }

  handleIncrement = () => {
    const newQuantity = this.state.quantity + 1;
    this.setState({ quantity: newQuantity });
    this.props.item.quantity = newQuantity;
    this.props.onQuantityChange(this.props.item.id, newQuantity);
  }

  handleDecrement = () => {
    if (this.state.quantity > 1) {
      const newQuantity = this.state.quantity - 1;
      this.setState({ quantity: newQuantity });
      this.props.item.quantity = newQuantity;
      this.props.onQuantityChange(this.props.item.id, newQuantity);
    } else {
      this.props.onDelete(this.props.item.id);
    }
  }

  render() {
    return (
        <div className='item'>
          <img src={"/img/" + this.props.item.img} alt={this.props.item.title}/>
          <div className='item-info'>
            <h3>{this.props.item.title}</h3>
            <b className='price'>{this.props.item.price}$</b>
          </div>
          <div className='item-controls'>
            <FaMinus 
              className='control-btn'
              onClick={this.handleDecrement}
              title='Уменьшить количество'
            />
            <input 
              type='number' 
              className='quantity-input'
              value={this.state.quantity}
              onChange={this.handleQuantityChange}
              min='1'
            />
            <FaPlus 
              className='control-btn'
              onClick={this.handleIncrement}
              title='Увеличить количество'
            />
          </div>
          <FaTrash 
            className='delete-item'
            onClick={() => this.props.onDelete(this.props.item.id)}
            title='Удалить из корзины'
          />
        </div>
    );
  }
}   

export default Orders;