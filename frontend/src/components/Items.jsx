import React, { Component } from 'react'
import Item from './Item'

export class Items extends Component {
  render() {
    return (
      // Контейнер <main> в App.js уже имеет стили сетки, 
      // поэтому здесь мы просто выводим список без лишних div
      <>
        {this.props.items.map(el => (
            <Item key={el.id} item={el} onAdd={this.props.onAdd} />
        ))}
      </>
    )
  }
}

export default Items