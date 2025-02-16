import React from 'react'
import { Link, graphql } from 'gatsby'
import 'flag-icon-css/css/flag-icon.min.css'
import SEO from '../components/seo'
import { rhythm } from '../utils/typography'
import BlogPostTemplate from '../components/Layouts/BlogLayout'
import Layout from '../components/Layouts/Layout'
import DeveloperCard from '../components/DeveloperCard'
import Search from 'antd/lib/input/Search'
import 'antd/dist/antd.css'
import { Button, Input, Popover, Select, Tag } from 'antd'
import { ArrowUpOutlined, ArrowDownOutlined } from '@ant-design/icons'

class DeveloperCommunityHome extends React.Component {
  constructor(props) {
    super(props)
    this.initialFilter = { type: '', value: '', name: '' }
    this.state = {
      searchText: '',
      filterableFields: [
        { name: 'Github user name', type: 'githubUserId' },
        { name: 'Name', type: 'name' },
        { name: 'Country', type: 'country' },
      ],
      sortableFields: [
        { name: 'Country', type: 'country' },
        { name: 'Github user name', type: 'githubUserId' },
        { name: 'Name', type: 'name' },
        { name: "This year's commits", type: 'thisYearContribution' },
        { name: 'Followers', type: 'followersCount' },
      ],
      selectedFilter: this.initialFilter,
      filters: [],
      isAddFilterPopoverOpen: false,
      sort: { field: '', type: '', order: '' },
    }
  }

  handleSearchChange = event => {
    const value = event.target.value
    this.setState({
      searchText: value,
    })
  }

  deleteFilter = index => {
    const updatedFilters = this.state.filters.filter((filter, i) => i !== index)
    this.setState({
      filters: updatedFilters,
    })
  }

  onPopoverVisibilityChange = visibility => {
    this.setState({
      isAddFilterPopoverOpen: visibility,
    })
  }

  hidePopover = () => {
    this.setState({
      isAddFilterPopoverOpen: false,
    })
  }

  updateSelectedFilterValue = event => {
    const value = event.target.value
    this.setState(prevState => ({
      ...prevState,
      selectedFilter: {
        ...prevState.selectedFilter,
        value: value,
      },
    }))
  }

  updateSelectedFilterType = value => {
    this.setState(prevState => ({
      ...prevState,
      selectedFilter: {
        ...prevState.selectedFilter,
        ...JSON.parse(value),
      },
    }))
  }

  addFilter = () => {
    this.setState({
      isAddFilterPopoverOpen: false,
      filters: this.state.filters.concat(this.state.selectedFilter),
      selectedFilter: { ...this.initialFilter },
    })
  }

  toggleSort = sort => {
    if (this.state.sort && sort.type === this.state.sort.type) {
      if (this.state.sort.order === 'asc') {
        this.setState({
          sort: {
            ...this.state.sort,
            order: 'dsc',
          },
        })
      } else {
        this.setState({
          sort: null,
        })
      }
    } else {
      this.setState({
        sort: { field: sort.field, type: sort.type, order: 'asc' },
      })
    }
  }

  getFilteredList = contributors => {
    const list = contributors.reduce((list, current) => {
      const isFilteredContributor = this.state.filters.every(filter => {
        console.log('====> ', filter.value)
        if (
          current[filter.type]
            .toLowerCase()
            .includes(filter.value.toLowerCase())
        ) {
          return true
        }
      })

      if (isFilteredContributor) {
        list.push(current)
      }

      return list
    }, [])
    return list
  }

  getSortedList = contributors => {
    const list = !!this.state.sort
      ? contributors.sort((a, b) => {
          if (this.state.sort.order === 'asc') {
            if (b[this.state.sort.type]) {
              if (typeof b[this.state.sort.type] === 'number') {
                const order = a[this.state.sort.type] - b[this.state.sort.type]
                return order
              } else {
                const order =
                  b[this.state.sort.type] &&
                  b[this.state.sort.type]
                    .toString()
                    .localeCompare(
                      a[this.state.sort.type] &&
                        a[this.state.sort.type].toString()
                    )
                return order
              }
            }
          } else {
            if (typeof b[this.state.sort.type] === 'number') {
              const order = b[this.state.sort.type] - a[this.state.sort.type]
              return order
            } else {
              const order =
                a[this.state.sort.type] &&
                a[this.state.sort.type]
                  .toString()
                  .localeCompare(
                    b[this.state.sort.type] &&
                      b[this.state.sort.type].toString()
                  )
              return order
            }
          }
        })
      : contributors

    return list
  }

  render() {
    const {
      data: {
        allContributor: { nodes: contributors },
      },
    } = this.props

    const filteredList = this.getFilteredList(contributors)

    const sortedList = this.getSortedList(filteredList)

    const searchFilterList = sortedList.filter(contributor =>
      contributor.githubUserId
        .toLowerCase()
        .includes(this.state.searchText.toLowerCase())
    )

    return (
      <Layout>
        <SEO
          url="/"
          title="Developer Community Stats"
          description="A repository to encourage beginners to contribute to open source and for all contributors to view their Github stats."
          keywords={[
            `GithubStats`,
            `github`,
            `stats`,
            `developer`,
            `community`,
          ]}
        />
        <div className="filter-bar">
          <Input
            enterButton="Search"
            size="large"
            className="search-bar"
            placeholder="Search dev by username"
            onChange={this.handleSearchChange}
            value={this.state.searchText}
          />
          <div className="sort-list">
            {this.state.sortableFields.map(sort => (
              <div
                key={sort.type}
                onClick={() => this.toggleSort(sort)}
                className="sort-field"
              >
                {sort.name}{' '}
                {this.state.sort && sort.type === this.state.sort.type ? (
                  this.state.sort.order === 'asc' ? (
                    <ArrowUpOutlined />
                  ) : (
                    <ArrowDownOutlined />
                  )
                ) : null}
              </div>
            ))}
          </div>
          <Popover
            overlayClassName="add-filter-overlay"
            onVisibleChange={this.onPopoverVisibilityChange}
            visible={this.state.isAddFilterPopoverOpen}
            placement="bottom"
            content={
              <div className="add-filter-container">
                <Select
                  placeholder="Select a filter"
                  allowClear
                  style={{ width: 120 }}
                  onChange={this.updateSelectedFilterType}
                >
                  {this.state.filterableFields.map(filter => (
                    <Select.Option
                      value={JSON.stringify({
                        name: filter.name,
                        type: filter.type,
                      })}
                    >
                      {filter.name}
                    </Select.Option>
                  ))}
                </Select>
                <Input
                  placeholder="Enter a filter value"
                  onChange={this.updateSelectedFilterValue}
                />
                {!!this.state.selectedFilter.name && (
                  <span className="filter-preview">
                    {this.state.selectedFilter.name} ={' '}
                    {this.state.selectedFilter.value}
                  </span>
                )}
                <div className="action-buttons">
                  <Button type="outline" onClick={this.hidePopover}>
                    Cancel
                  </Button>
                  <Button type="primary" onClick={this.addFilter}>
                    Apply
                  </Button>
                </div>
              </div>
            }
            destroyTooltipOnHide
            title="Add filter"
            trigger="click"
            disabled={
              this.state.filters.length === this.state.filterableFields.length
            }
          >
            <Button
              disabled={
                this.state.filters.length === this.state.filterableFields.length
              }
              className="add-filter-button"
              type="primary"
            >
              Add filter
            </Button>
          </Popover>
          <div className="filters-list">
            {this.state.filters.map((filter, index) => (
              <Tag
                className="filter"
                closable
                key={index}
                onClose={() => this.deleteFilter(index)}
              >
                {`${filter.name} = ${filter.value}`}
              </Tag>
            ))}
          </div>
        </div>
        <div className="developer-card-container">
          {searchFilterList.map((contributorStats, i) => (
            <DeveloperCard
              position={i + 1}
              {...contributorStats}
              key={contributorStats.id}
              searchKey={this.state.searchText}
            />
          ))}
        </div>
      </Layout>
    )
  }
}

export default DeveloperCommunityHome

export const pageQuery = graphql`
  query {
    site {
      siteMetadata {
        title
      }
    }
    allContributor(sort: { order: DESC, fields: thisYearContribution }) {
      totalCount
      nodes {
        id
        countryCode
        repositoryCount
        contributionYears
        country
        firstContribution
        followersCount
        githubUserId
        issuesCount
        linkedin
        website
        name
        pullRequestsCount
        repoContributedCount
        thisYearContribution
        twitter
        avatarUrl
      }
    }
  }
`
