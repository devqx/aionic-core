import { bind } from 'decko';
import { NextFunction, Request, Response } from 'express';

import { Project } from './model';
import { ProjectService } from './service';

export class ProjectController {
	private readonly service: ProjectService = new ProjectService();

	/**
	 * @param {Request} req
	 * @param {Response} res
	 * @param {NextFunction} next
	 * @returns {Promise<Response | void>} Returns HTTP response
	 */
	@bind
	public async readProjects(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
		try {
			const { orderby, orderdir, limit } = req.query;

			let order = {};
			let take: object = {};

			if (orderby || orderdir) {
				order = { order: { [orderby || 'id']: orderdir || 'ASC' } };
			}

			if (limit) {
				take = { take: limit };
			}

			const projects: Project[] = await this.service.readProjects({
				relations: ['author', 'tasks', 'tasks.status'],
				...order,
				...take
			});

			return res.json({ status: res.statusCode, data: projects });
		} catch (err) {
			return next(err);
		}
	}

	/**
	 * @param {Request} req
	 * @param {Response} res
	 * @param {NextFunction} next
	 * @returns {Promise<Response | void>} Returns HTTP response
	 */
	@bind
	public async readProject(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
		try {
			const { projectID } = req.params;

			if (!projectID) {
				return res.status(400).json({ status: 400, error: 'Invalid request' });
			}

			const project: Project | undefined = await this.service.readProject({
				relations: ['author', 'tasks', 'tasks.priority', 'tasks.assignee', 'tasks.author', 'tasks.status'],
				where: {
					id: projectID
				}
			});

			return res.json({ status: res.statusCode, data: project });
		} catch (err) {
			return next(err);
		}
	}

	/**
	 * @param {Request} req
	 * @param {Response} res
	 * @param {NextFunction} next
	 * @returns {Promise<Response | void>} Returns HTTP response
	 */
	@bind
	public async createProject(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
		try {
			if (!req.body.project) {
				return res.status(400).json({ status: 400, error: 'Invalid request' });
			}

			const newProject: Project = await this.service.saveProject(req.body.project);

			return res.json({ status: res.statusCode, data: newProject });
		} catch (err) {
			return next(err);
		}
	}

	/**
	 * @param {Request} req
	 * @param {Response} res
	 * @param {NextFunction} next
	 * @returns {Promise<Response | void>} Returns HTTP response
	 */
	@bind
	public async updateProject(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
		try {
			const { projectID } = req.params;

			if (!projectID || !req.body.project) {
				return res.status(400).json({ status: 400, error: 'Invalid request' });
			}

			const project: Project | undefined = await this.service.readProject({
				where: {
					id: projectID
				}
			});

			if (!project) {
				return res.status(404).json({ status: 404, error: 'project not found' });
			}

			const updatedProject: Project = await this.service.saveProject(req.body.project);

			return res.json({ status: res.statusCode, data: updatedProject });
		} catch (err) {
			return next(err);
		}
	}

	/**
	 * @param {Request} req
	 * @param {Response} res
	 * @param {NextFunction} next
	 * @returns {Promise<Response | void>} Returns HTTP response
	 */
	@bind
	public async deleteProject(req: Request, res: Response, next: NextFunction): Promise<Response | void> {
		try {
			const { projectID } = req.params;

			if (!projectID) {
				return res.status(400).json({ status: 400, error: 'Invalid request' });
			}

			const project: Project | undefined = await this.service.readProject({
				where: {
					id: projectID
				}
			});

			if (!project) {
				return res.status(404).json({ status: 404, error: 'Project not found' });
			}

			await this.service.deleteProject(project);

			return res.status(204).send();
		} catch (err) {
			return next(err);
		}
	}
}
