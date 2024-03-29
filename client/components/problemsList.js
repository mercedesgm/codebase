import React, {Component} from 'react'
import {connect} from 'react-redux'
import {getAllProblems, clearSingleProblem} from '../store/problems'
import {Link} from 'react-router-dom'

// Until we have a CSS file
const styles = {
  listItem: {display: 'flex'}
}
class ProblemList extends Component {
  constructor(props) {
    super(props)
  }

  componentDidMount() {
    this.props.getAllProblems()
    this.props.clearSingleProblem()
  }

  render() {
    return (
      <div>
        <ul>
          {this.props.problems.map(el => {
            return (
              <li key={el.id} style={styles.listItem}>
                <h6>{el.category}</h6>
                <Link
                  to={{
                    pathname: `/problems/${el.id}`
                  }}
                >
                  <h6>{el.name}</h6>
                </Link>
                <p>Difficulty: {el.points < 50 ? 'Easy' : 'Medium'}</p>
              </li>
            )
          })}
        </ul>
      </div>
    )
  }
}

const mapState = state => {
  return {
    problems: state.problems.allProblems
  }
}

const mapDispatch = dispatch => {
  return {
    getAllProblems: () => dispatch(getAllProblems()),
    clearSingleProblem: () => dispatch(clearSingleProblem())
  }
}

export default connect(mapState, mapDispatch)(ProblemList)
