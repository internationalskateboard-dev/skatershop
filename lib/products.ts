export type Product = {
  id: string
  name: string
  price: number
  image: string
  desc: string
  details: string
  sizes: string[]
}

export const products: Product[] = [
  {
    id: 'hoodie-black',
    name: 'Hoodie Oversize Black',
    price: 17.99,
    image: '/images/hoodie-black.jpg',
    desc: 'Sudadera negra oversize, cultura skate.',
    details:
      'Algodón pesado 450gsm, corte hombro caído, print frontal SKATER STORE distressed en amarillo.',
    sizes: ['S', 'M', 'L', 'XL'],
  },
  {
    id: 'cap-classic',
    name: 'Snapback Classic Logo',
    price: 11.99,
    image: '/images/cap-classic.jpg',
    desc: 'Gorra plana con logo bordado SKATER STORE.',
    details:
      'Estructura 6 paneles, visera plana, cierre snapback. Bordado amarillo textura desgaste.',
    sizes: ['ONE SIZE'],
  },
]

// helper para buscar un producto por id
export function getProductById(id: string) {
  return products.find((p) => p.id === id)
}
