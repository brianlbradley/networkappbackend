const getTableData= (req, res, db) => {
  db.select("*").from('suggesttable')
    .then(items => {
      if(items.length){
        res.json(items)
      } else {
        res.json({dataExists: 'false'})
      }
    })
    .catch(err => res.status(400).json({dbError: 'db error'}))
}

const postTableData = (req, res, db) => {
  const { id, name, location, restaurant, skills, hobbies } = req.body
 
  const added = new Date()
  db('suggesttable').insert({ name, location, restaurant, skills, hobbies, added})
    .returning('*')
    .then(item => {
      res.json(item)
    })
    .catch(err => res.status(400).json({dbError: 'db error'}))
}

const putTableData =(req, res, db) => {
  const { id, name, location, restaurant, skills, hobbies} = req.body
  db('suggesttable').where({id}).update({name, location, restaurant, skills, hobbies})
    .returning('*')
    .then(item => {
      res.json(item)
    })
    .catch(err => res.status(400).json({dbError: 'db error'}))
}

const deleteTableData =(req, res, db) => {
  const { id } = req.body
  db('suggesttable').where({id}).del()
    .then(() => {
      res.json({delete: 'true'})
    })
    .catch(err => res.status(400).json({dbError: 'db error'}))
}


module.exports = {
  getTableData,
  postTableData,
  putTableData,
  deleteTableData
}