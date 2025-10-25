import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Header from './components/layout/Header';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import ArticleDetail from './pages/ArticleDetail';
import AdminDashboard from './pages/AdminDashboard';
import WriteArticle from './pages/WriteArticle';
import ApplyAuthor from './pages/ApplyAuthor';
import AuthorList from './pages/AuthorList';
import AuthorDetail from './pages/AuthorDetail';
import CreateAd from './pages/CreateAd';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50">
        <Header />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/article/:id" element={<ArticleDetail />} />
          <Route path="/write" element={<WriteArticle />} />
          <Route path="/author/apply" element={<ApplyAuthor />} />
          <Route path="/authors" element={<AuthorList />} />
          <Route path="/author/:id" element={<AuthorDetail />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/ad/create" element={<CreateAd />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
