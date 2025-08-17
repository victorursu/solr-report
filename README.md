# Solr Report Dashboard

A modern Next.js application for running reports and queries on Apache Solr search servers. Built with React, TypeScript, and Tailwind CSS.

**Created by:** [Victor Ursu](https://github.com/victorursu)

## 🚀 Features

### 🔌 **Connection Management**
- Real-time Solr server connectivity testing
- Visual connection status indicators
- Authentication support (username/password)
- Automatic connection monitoring

### 🔍 **Advanced Query Builder**
- Visual interface for building complex Solr queries
- Support for all major Solr query parameters:
  - **Query (q)**: Main search query with syntax highlighting
  - **Filter Queries (fq)**: Multiple filter queries for performance
  - **Rows & Start**: Pagination controls
  - **Sort**: Field-based sorting
  - **Fields (fl)**: Field selection
  - **Faceting**: Built-in faceting support

### 📊 **Results Display**
- **Table View**: Structured table with all fields
- **JSON View**: Raw JSON response for debugging
- **Server-side Pagination**: Proper Solr pagination support
- **Export Functionality**: Download results as JSON files
- **Real-time Query Timing**: Client-side performance measurement

### 🏷️ **Hash-based Environment Filtering**
- **Distinct Hash Listing**: View all available environment hashes
- **Interactive Hash Selection**: Click to filter by environment
- **Visual Hash Indicators**: Color-coded hash display
- **Hash Statistics**: Document counts per environment

### 🔧 **Configurable Field-based Filtering**
- **Dynamic Unique Values**: Configurable field for unique value filtering via `SHOW_UNIQUE_VALUES`
- **Interactive Value Selection**: Click to filter queries by any field value
- **Visual Value Indicators**: Color-coded value display with document counts
- **Flexible Configuration**: Easy field switching through environment variables

### 📈 **Faceting & Analytics**
- **Field Faceting**: Get distinct counts of field values
- **Facet Visualization**: Clean display of facet results
- **Configurable Facet Limits**: Customizable facet parameters

### 🎨 **Modern UI/UX**
- **Responsive Design**: Works on desktop and mobile
- **Dark Text Visibility**: Optimized for readability
- **Real-time Updates**: Live status and query execution
- **Loading States**: Smooth user experience
- **Error Handling**: Comprehensive error display

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Form Handling**: React Hook Form
- **Backend**: Next.js API Routes

## 📋 Prerequisites

- Node.js 18+ 
- npm or yarn
- Apache Solr server running and accessible

## 🚀 Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/victorursu/solr-report.git
   cd solr-report
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env.local` file in the root directory:
   ```env
   # Solr Connection Configuration
   SOLR_URL=http://localhost:8983/solr
   SOLR_CORE=your_core_name
   SOLR_USERNAME=
   SOLR_PASSWORD=
   
   # Optional: Additional Solr settings
   SOLR_TIMEOUT=30000
   SOLR_MAX_ROWS=1000
   
   # Unique Values Configuration
   SHOW_UNIQUE_VALUES=site
   ```

   **Configuration Options:**
   - `SOLR_URL`: Your Solr server URL (default: http://localhost:8983/solr)
   - `SOLR_CORE`: The Solr core/collection name to query
   - `SOLR_USERNAME`: Username for authentication (if required)
   - `SOLR_PASSWORD`: Password for authentication (if required)
   - `SOLR_TIMEOUT`: Request timeout in milliseconds (default: 30000)
   - `SOLR_MAX_ROWS`: Maximum rows to return (default: 1000)
   - `SHOW_UNIQUE_VALUES`: Field name to display unique values for filtering (e.g., "site", "category", "type")

4. **Start the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📖 Usage

### 1. Connection Testing

The dashboard automatically tests your Solr connection on load. You can manually test the connection using the "Test" button in the connection status panel.

### 2. Building Queries

Use the Query Builder to construct Solr queries:

- **Query (q)**: Main search query (e.g., `*:*`, `title:search`, `content:*keyword*`)
- **Filter Queries (fq)**: Add multiple filter queries for performance
- **Rows**: Number of results to return
- **Start**: Starting position for pagination
- **Sort**: Sort order (e.g., `score desc`, `date asc`)
- **Fields (fl)**: Comma-separated list of fields to return
- **Faceting**: Enable faceting on specific fields

### 3. Environment Filtering

- **View Available Hashes**: The "Available Hashes" section shows all distinct hash values
- **Filter by Environment**: Click on any hash to filter queries by that environment
- **Clear Filters**: Use the "Clear filter" button to remove hash-based filtering

### 4. Configurable Field Filtering

- **Configure Field**: Set `SHOW_UNIQUE_VALUES=fieldname` in your `.env.local` file
- **View Unique Values**: The component automatically appears and shows all unique values for the configured field
- **Filter by Value**: Click on any value to filter queries by that field value
- **Combine Filters**: Works alongside hash filtering for complex queries
- **Clear Filters**: Use the "Clear filter" button to remove value-based filtering

### 5. Query Examples

**Basic Queries:**
- `*:*` - All documents
- `title:search` - Documents with "search" in title field
- `content:*keyword*` - Wildcard search
- `date:[2023-01-01 TO 2023-12-31]` - Date range query

**Advanced Queries:**
- `title:search AND category:news` - Boolean query
- `price:[10 TO 100]` - Numeric range
- `tags:(tag1 OR tag2)` - Multi-value field query

**Environment-Specific Queries:**
- Select a hash from the "Available Hashes" section
- Execute any query to see results filtered by that environment
- Combine with other filter queries for complex filtering

### 6. Viewing Results

Results are displayed in two modes:
- **Table View**: Structured table with all fields
- **JSON View**: Raw JSON response

Features include:
- Server-side pagination for large result sets
- Export functionality
- Facet visualization
- Query performance metrics

## 🔌 API Endpoints

The application provides REST API endpoints for programmatic access:

### Query Execution
```
POST /api/solr/query
Content-Type: application/json

{
  "q": "*:*",
  "rows": 10,
  "start": 0,
  "sort": "score desc",
  "facet": true,
  "facet.field": ["category", "tags"]
}
```

### Connection Testing
```
GET /api/solr/connection?action=test
GET /api/solr/connection?action=info
GET /api/solr/connection?action=schema
```

### Configuration
```
GET /api/solr/config
```

Returns the current Solr configuration (URL and core).

## 🏗️ Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── api/               # API routes
│   │   └── solr/         # Solr API endpoints
│   │       ├── query/    # Query execution
│   │       ├── connection/ # Connection testing
│   │       └── config/   # Configuration endpoint
│   ├── globals.css       # Global styles
│   ├── layout.tsx        # Root layout
│   └── page.tsx          # Home page
├── components/           # React components
│   ├── ConnectionStatus.tsx
│   ├── QueryForm.tsx
│   ├── QueryResults.tsx
│   ├── HashList.tsx
│   ├── UniqueValuesList.tsx
│   ├── SolrDashboard.tsx
│   └── DynamicTitle.tsx
└── lib/                 # Utility libraries
    └── solr-client.ts   # Solr client implementation
```

## 📜 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## 🔧 Development

### Key Components

- **SolrDashboard**: Main orchestrator component
- **QueryForm**: Form for building Solr queries
- **QueryResults**: Results display with pagination
- **HashList**: Environment hash filtering
- **UniqueValuesList**: Configurable field value filtering
- **ConnectionStatus**: Connection monitoring
- **SolrClient**: Server-side Solr interaction

### State Management

The application uses React hooks for state management:
- Connection status
- Query results
- Loading states
- Error handling
- Hash selection
- Value selection
- Query timing

## 🐛 Troubleshooting

### Connection Issues

1. **Check Solr URL**: Ensure `SOLR_URL` points to your Solr server
2. **Verify Core Name**: Make sure `SOLR_CORE` matches an existing core
3. **Network Access**: Confirm the Solr server is accessible from your machine
4. **Authentication**: If using authentication, provide correct credentials

### Query Errors

1. **Syntax**: Check Solr query syntax
2. **Field Names**: Verify field names exist in your schema
3. **Permissions**: Ensure your Solr user has read permissions

### Performance Issues

1. **Limit Results**: Use appropriate `rows` parameter
2. **Use Filters**: Apply filter queries (fq) for better performance
3. **Index Size**: Large indices may require optimization

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

**Victor Ursu**
- GitHub: [@victorursu](https://github.com/victorursu)
- Project: [solr-report](https://github.com/victorursu/solr-report)

## 🙏 Acknowledgments

- Apache Solr community for the excellent search platform
- Next.js team for the amazing React framework
- Tailwind CSS for the utility-first styling approach
- Lucide for the beautiful icon set

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review Solr documentation
3. Open an issue on [GitHub](https://github.com/victorursu/solr-report)

---

**Note**: This application is designed for development and administrative use. For production deployments, consider implementing proper authentication, rate limiting, and security measures.
