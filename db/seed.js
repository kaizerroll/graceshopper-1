'use strict'

const db = require('APP/db')
  , { User, Thing, Favorite, Promise } = db
  , { mapValues } = require('lodash')

function seedEverything() {
  const seeded = {
    users: users(),
    things: things(),
  }

  seeded.favorites = favorites(seeded)

  return Promise.props(seeded)
}

const users = seed(User, {
  god: {
    email: 'god@example.com',
    name: 'So many names',
    password: '1234',
  },
  barack: {
    name: 'Barack Obama',
    email: 'barack@example.gov',
    password: '1234'
  },
})

const things = seed(Thing, {
  santa: {
    name: 'Santa Claus',
    price: 9999,
    description: 'We will do your Christmas shopping, wrap each present neatly, and write out heartfelt, personalized Christmas cards'
  },
  fairy: {
    name: 'Tooth Fairy',
    price: 999,
    description: 'We will retrieve a crisp, new five dollar bill from the bank, place the bill under your child\'s pillow, and dispose of the tooth in an eco-friendly manner'
  },
  bunny: {
    name: 'Easter Bunny',
    price: 4999,
    description: 'We will purchase an appropriate amount of pastel candy, place the candy in plastic eggs, and hide the eggs around your house'
  },
  krampus: {
    name: 'Krampus',
    price: 19999,
    description: 'We will don half-goat/half-demon attire, follow your child around, and repeatedly frighten them for a period of 24 hours'
  },
  cupid: {
    name: 'Cupid',
    price: 5499,
    description: 'We will purchase the trendiest pack valentines from CVS, tape each one to a small box of candy hearts, and write out heartfelt, personalized messages to each child in the class'
  },
  greatpumpkin: {
    name: 'Great Pumpkin',
    price: 4499,
    description: 'We will hand sew the perfect costume for your child, purchase the exact right amount of candy, and answer your door when the trick-or-treaters arrive'
  }
})

const favorites = seed(Favorite,
  // We're specifying a function here, rather than just a rows object.
  // Using a function lets us receive the previously-seeded rows (the seed
  // function does this wiring for us).
  //
  // This lets us reference previously-created rows in order to create the join
  // rows. We can reference them by the names we used above (which is why we used
  // Objects above, rather than just arrays).
  // ({ users, things }) => ({
    // The easiest way to seed associations seems to be to just create rows
    // in the join table.
    // 'obama loves surfing': {
    //   user_id: users.barack.id,    // users.barack is an instance of the User model
      // that we created in the user seed above.
      // The seed function wires the promises so that it'll
      // have been created already.
//       thing_id: things.surfing.id  // Same thing for things.
//     },
//     'god is into smiting': {
//       user_id: users.god.id,
//       thing_id: things.smiting.id
//     },
//     'obama loves puppies': {
//       user_id: users.barack.id,
//       thing_id: things.puppies.id
//     },
//     'god loves puppies': {
//       user_id: users.god.id,
//       thing_id: things.puppies.id
//     },
//   })
// )

if (module === require.main) {
  db.didSync
    .then(() => db.sync({ force: true }))
    .then(seedEverything)
    .finally(() => process.exit(0))
}

class BadRow extends Error {
  constructor(key, row, error) {
    super(error)
    this.cause = error
    this.row = row
    this.key = key
  }

  toString() {
    return `[${this.key}] ${this.cause} while creating ${JSON.stringify(this.row, 0, 2)}`
  }
}

// seed(Model: Sequelize.Model, rows: Function|Object) ->
//   (others?: {...Function|Object}) -> Promise<Seeded>
//
// Takes a model and either an Object describing rows to insert,
// or a function that when called, returns rows to insert. returns
// a function that will seed the DB when called and resolve with
// a Promise of the object of all seeded rows.
//
// The function form can be used to initialize rows that reference
// other models.
function seed(Model, rows) {
  return (others = {}) => {
    if (typeof rows === 'function') {
      rows = Promise.props(
        mapValues(others,
          other =>
            // Is other a function? If so, call it. Otherwise, leave it alone.
            typeof other === 'function' ? other() : other)
      ).then(rows)
    }

    return Promise.resolve(rows)
      .then(rows => Promise.props(
        Object.keys(rows)
          .map(key => {
            const row = rows[key]
            return {
              key,
              value: Promise.props(row)
                .then(row => Model.create(row)
                  .catch(error => { throw new BadRow(key, row, error) })
                )
            }
          }).reduce(
          (all, one) => Object.assign({}, all, { [one.key]: one.value }),
          {}
          )
      )
      )
      .then(seeded => {
        console.log(`Seeded ${Object.keys(seeded).length} ${Model.name} OK`)
        return seeded
      }).catch(error => {
        console.error(`Error seeding ${Model.name}: ${error} \n${error.stack}`)
      })
  }
}

module.exports = Object.assign(seed, { users, things, favorites })
