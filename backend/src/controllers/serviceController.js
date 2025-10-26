const { Service, Operator } = require('../models');
const CryptoUtils = require('../utils/crypto');

/**
 * 서비스 컨트롤러
 * 웹사이트 서비스 등록 및 API 키 관리
 */

class ServiceController {
  /**
   * 서비스 등록
   * POST /api/service/register
   */
  static async registerService(req, res) {
    try {
      const { name, url, description, plan } = req.body;
      const operatorId = req.operator.operatorId;

      if (!name || !url) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: name, url'
        });
      }

      // URL 형식 검증
      try {
        new URL(url);
      } catch (error) {
        return res.status(400).json({
          success: false,
          error: 'Invalid URL format'
        });
      }

      // API 키 및 시크릿 생성
      const apiKey = CryptoUtils.generateApiKey();
      const apiSecret = CryptoUtils.generateApiSecret();

      // 플랜별 사용량 제한 설정
      const usageLimits = {
        free: 100000,    // 월 10만 회
        basic: 1000000,  // 월 100만 회
        pro: 10000000,   // 월 1000만 회
        enterprise: Infinity // 무제한
      };

      const selectedPlan = plan || 'free';
      const usageLimit = usageLimits[selectedPlan] || usageLimits.free;

      // 서비스 생성
      const service = Service.create({
        operatorId,
        name,
        url,
        description: description || '',
        apiKey,
        apiSecret,
        plan: selectedPlan,
        usageLimit
      });

      console.log(`[Service] New service registered: ${name} (${service.id})`);

      res.status(201).json({
        success: true,
        message: 'Service registered successfully',
        data: {
          id: service.id,
          name: service.name,
          url: service.url,
          apiKey: service.apiKey,
          apiSecret: service.apiSecret,
          plan: service.plan,
          usageLimit: service.usageLimit,
          createdAt: service.createdAt
        }
      });
    } catch (error) {
      console.error('[Service] Registration error:', error);
      res.status(500).json({
        success: false,
        error: 'Service registration failed',
        message: error.message
      });
    }
  }

  /**
   * 운영자의 서비스 목록 조회
   * GET /api/service/list
   */
  static async getServices(req, res) {
    try {
      const operatorId = req.operator.operatorId;

      const services = Service.findByOperator(operatorId);

      res.status(200).json({
        success: true,
        count: services.length,
        data: services.map(service => ({
          id: service.id,
          name: service.name,
          url: service.url,
          description: service.description,
          plan: service.plan,
          isActive: service.isActive,
          usageLimit: service.usageLimit,
          currentUsage: service.currentUsage,
          createdAt: service.createdAt
        }))
      });
    } catch (error) {
      console.error('[Service] Get services error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve services',
        message: error.message
      });
    }
  }

  /**
   * 서비스 상세 조회
   * GET /api/service/:id
   */
  static async getService(req, res) {
    try {
      const { id } = req.params;
      const operatorId = req.operator.operatorId;

      const service = Service.findById(id);

      if (!service) {
        return res.status(404).json({
          success: false,
          error: 'Service not found'
        });
      }

      // 권한 확인
      if (service.operatorId !== operatorId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      res.status(200).json({
        success: true,
        data: {
          id: service.id,
          name: service.name,
          url: service.url,
          description: service.description,
          apiKey: service.apiKey,
          apiSecret: service.apiSecret,
          plan: service.plan,
          isActive: service.isActive,
          usageLimit: service.usageLimit,
          currentUsage: service.currentUsage,
          createdAt: service.createdAt,
          updatedAt: service.updatedAt
        }
      });
    } catch (error) {
      console.error('[Service] Get service error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve service',
        message: error.message
      });
    }
  }

  /**
   * 서비스 업데이트
   * PUT /api/service/:id
   */
  static async updateService(req, res) {
    try {
      const { id } = req.params;
      const { name, url, description, isActive } = req.body;
      const operatorId = req.operator.operatorId;

      const service = Service.findById(id);

      if (!service) {
        return res.status(404).json({
          success: false,
          error: 'Service not found'
        });
      }

      // 권한 확인
      if (service.operatorId !== operatorId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      const updateData = {};
      if (name) updateData.name = name;
      if (url) updateData.url = url;
      if (description !== undefined) updateData.description = description;
      if (isActive !== undefined) updateData.isActive = isActive;

      service.update(updateData);

      console.log(`[Service] Service updated: ${service.name} (${service.id})`);

      res.status(200).json({
        success: true,
        message: 'Service updated successfully',
        data: {
          id: service.id,
          name: service.name,
          url: service.url,
          description: service.description,
          isActive: service.isActive,
          updatedAt: service.updatedAt
        }
      });
    } catch (error) {
      console.error('[Service] Update service error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update service',
        message: error.message
      });
    }
  }

  /**
   * API 키 재생성
   * POST /api/service/:id/regenerate-key
   */
  static async regenerateApiKey(req, res) {
    try {
      const { id } = req.params;
      const operatorId = req.operator.operatorId;

      const service = Service.findById(id);

      if (!service) {
        return res.status(404).json({
          success: false,
          error: 'Service not found'
        });
      }

      // 권한 확인
      if (service.operatorId !== operatorId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      // 새 API 키 생성
      const newApiKey = CryptoUtils.generateApiKey();
      const newApiSecret = CryptoUtils.generateApiSecret();

      service.update({
        apiKey: newApiKey,
        apiSecret: newApiSecret
      });

      console.log(`[Service] API key regenerated for service: ${service.name} (${service.id})`);

      res.status(200).json({
        success: true,
        message: 'API key regenerated successfully',
        data: {
          apiKey: newApiKey,
          apiSecret: newApiSecret
        }
      });
    } catch (error) {
      console.error('[Service] Regenerate API key error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to regenerate API key',
        message: error.message
      });
    }
  }

  /**
   * 서비스 삭제
   * DELETE /api/service/:id
   */
  static async deleteService(req, res) {
    try {
      const { id } = req.params;
      const operatorId = req.operator.operatorId;

      const service = Service.findById(id);

      if (!service) {
        return res.status(404).json({
          success: false,
          error: 'Service not found'
        });
      }

      // 권한 확인
      if (service.operatorId !== operatorId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      service.delete();

      console.log(`[Service] Service deleted: ${service.name} (${service.id})`);

      res.status(200).json({
        success: true,
        message: 'Service deleted successfully'
      });
    } catch (error) {
      console.error('[Service] Delete service error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete service',
        message: error.message
      });
    }
  }

  /**
   * 서비스 사용량 통계
   * GET /api/service/:id/stats
   */
  static async getServiceStats(req, res) {
    try {
      const { id } = req.params;
      const operatorId = req.operator.operatorId;

      const service = Service.findById(id);

      if (!service) {
        return res.status(404).json({
          success: false,
          error: 'Service not found'
        });
      }

      // 권한 확인
      if (service.operatorId !== operatorId) {
        return res.status(403).json({
          success: false,
          error: 'Access denied'
        });
      }

      const usagePercent = (service.currentUsage / service.usageLimit) * 100;

      res.status(200).json({
        success: true,
        data: {
          serviceId: service.id,
          serviceName: service.name,
          plan: service.plan,
          currentUsage: service.currentUsage,
          usageLimit: service.usageLimit,
          usagePercent: usagePercent.toFixed(2),
          remainingCalls: service.usageLimit - service.currentUsage,
          isActive: service.isActive
        }
      });
    } catch (error) {
      console.error('[Service] Get stats error:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to retrieve stats',
        message: error.message
      });
    }
  }
}

module.exports = ServiceController;
